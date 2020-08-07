import { useState, useEffect } from "react";
import tradeApi from "../services/tradeApiClient";
import useStoreSessionSelector from "./useStoreSessionSelector";
import useStoreSettingsSelector from "./useStoreSettingsSelector";
import useQuoteAssets from "./useQuoteAssets";
import useExchangesOptions from "./useExchangesOptions";
import useSkipFirstEffect from "./useSkipFirstEffect";
import { useIntl } from "react-intl";
import { uniqBy } from "lodash";
import {
  setSort as setSortAction,
  setTimeFrame as setTimeFrameAction,
  setBrowseExchange,
  setBrowseExchangeType,
  setBrowseQuote,
} from "../store/actions/settings";
import { showErrorAlert } from "../store/actions/ui";
import { useDispatch } from "react-redux";
/**
 * @typedef {import("../store/initialState").DefaultState} DefaultStateType
 * @typedef {import("../store/initialState").DefaultStateSession} StateSessionType
 * @typedef {import("../services/tradeApiClient.types").ProvidersCollection} ProvidersCollection
 * @typedef {import("../services/tradeApiClient.types").ProviderEntity} ProviderEntity
 * @typedef {import("../services/tradeApiClient.types").ProvidersPayload} ProvidersPayload
 * @typedef {import("../components/CustomSelect/CustomSelect").OptionType} OptionType
 */

/**
 * @typedef {Object} ProvidersOptions
 * @property {boolean} copyTradersOnly
 * @property {boolean} connectedOnly
 */

/**
 * @typedef {Object} ProvidersData
 * @property {ProvidersCollection} providers
 * @property {number} timeFrame
 * @property {function} setTimeFrame
 * @property {OptionType} coin
 * @property {Array<OptionType>} coins
 * @property {function} setCoin
 * @property {string} exchange
 * @property {Array<OptionType>} exchanges
 * @property {string} exchangeType
 * @property {Array<OptionType>} exchangeTypes
 * @property {function} setExchange
 * @property {function} setExchangeType
 * @property {string} sort
 * @property {function} setSort
 * @property {function} clearFilters
 * @property {function} clearSort
 */

/**
 * Hook to generate the providers data fetching and filtering.
 *
 * @param {ProvidersOptions} options Hook options.
 * @returns {ProvidersData} Providers and filtering objects.
 */
const useProvidersList = (options) => {
  const intl = useIntl();
  const storeSettings = useStoreSettingsSelector();
  const internalExchangeId = storeSettings.selectedExchange.internalId;
  const storeSession = useStoreSessionSelector();
  const dispatch = useDispatch();
  const { copyTradersOnly, connectedOnly } = options;

  /**
   * @type {{list: ProvidersCollection, filteredList: ProvidersCollection}} initialState
   */
  const initialState = { list: null, filteredList: null };
  const [providers, setProviders] = useState(initialState);

  /**
   * @type {string} Page shorthand
   */
  let page;
  if (connectedOnly) {
    page = copyTradersOnly ? "connectedCopyt" : "connectedSignalp";
  } else {
    page = copyTradersOnly ? "copyt" : "signalp";
  }

  const initTimeFrame = storeSettings.timeFrame[page] || 90;
  const [timeFrame, setTimeFrame] = useState(initTimeFrame);

  // Get quotes list unless connected providers only which don't need filters
  const quoteAssets = useQuoteAssets(!connectedOnly);
  const coins = [
    {
      val: "ALL",
      label: intl.formatMessage({ id: "fil.allcoins" }),
    },
  ].concat(
    Object.keys(quoteAssets).map((label) => ({
      val: label,
      label,
    })),
  );

  const initQuote = storeSettings.copyt.browse.quote;
  const [coin, setCoin] = useState(initQuote ? { val: initQuote, label: initQuote } : coins[0]);

  // Save settings to store when changed
  const saveQuote = () => {
    console.log("save");
    dispatch(setBrowseQuote(coin.val));
  };
  useSkipFirstEffect(saveQuote, [coin]);

  // Exchanges
  const initExchange = storeSettings.copyt.browse.exchange || "ALL";
  const exchanges = useExchangesOptions(true);
  const [exchange, setExchange] = useState(initExchange);

  // Save settings to store when changed
  const saveExchange = () => {
    dispatch(setBrowseExchange(exchange));
  };
  useSkipFirstEffect(saveExchange, [exchange]);

  // Exchange Types
  const initExchangeType = storeSettings.copyt.browse.exchangeType || "ALL";
  const exchangeTypes = [
    {
      val: "ALL",
      label: intl.formatMessage({
        id: "fil.allexchangeTypes",
      }),
    },
    { val: "spot", label: "Spot" },
    { val: "futures", label: "Futures" },
  ];
  const [exchangeType, setExchangeType] = useState(initExchangeType);

  // Save settings to store when changed
  const saveExchangeType = () => {
    dispatch(setBrowseExchangeType(exchangeType));
  };
  useSkipFirstEffect(saveExchangeType, [exchangeType]);

  // sort
  const initSort = () => {
    let val;
    if (!connectedOnly) {
      val = copyTradersOnly ? storeSettings.sort.copyt : storeSettings.sort.signalp;
    }
    return val || "RETURNS_DESC";
  };
  const [sort, setSort] = useState(initSort);

  const clearFilters = () => {
    setCoin(coins[0]);
    setExchange("ALL");
    setExchangeType("ALL");
  };

  const clearSort = () => {
    setSort("RETURNS_DESC");
  };

  const saveTimeFrame = () => {
    dispatch(setTimeFrameAction({ timeFrame, page }));
  };

  useEffect(saveTimeFrame, [timeFrame]);

  /**
   * Sort providers by selected option
   *
   * @param {ProvidersCollection} list Providers collection.
   * @returns {void}
   */
  const sortProviders = (list) => {
    const [key, direction] = sort.split("_");
    const listSorted = [...list].sort((a, b) => {
      let res = 0;
      switch (key) {
        case "RETURNS":
          res = a.returns + a.floating - (b.returns + b.floating);
          break;
        case "DATE":
          res = a.createdAt - b.createdAt;
          break;
        case "NAME":
          res = a.name.localeCompare(b.name);
          break;
        case "FEE":
          res = a.price - b.price;
          break;
        default:
          break;
      }
      return direction === "ASC" ? res : -res;
    });

    setProviders((s) => ({ ...s, filteredList: listSorted }));
  };
  const saveSort = () => {
    if (!connectedOnly) {
      dispatch(setSortAction({ sort, page }));
    }
  };

  // Sort providers on sort option change
  useEffect(() => {
    if (providers.filteredList) {
      sortProviders(providers.filteredList);
    }
    saveSort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  /**
   * Filter providers by selected options
   *
   * @param {ProvidersCollection} list Providers collection.
   * @returns {void}
   */
  const filterProviders = (list) => {
    const res = list.filter(
      (p) =>
        (coin.val === "ALL" || p.quote === coin.val) &&
        (exchange === "ALL" || p.exchanges.includes(exchange.toLowerCase())) &&
        (exchangeType === "ALL" || p.exchangeType.toLowerCase() === exchangeType.toLowerCase()),
    );
    sortProviders(res);
  };
  // Filter providers on filter change
  useEffect(() => {
    if (providers.list) {
      filterProviders(providers.list);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin, exchange, exchangeType]);

  const loadProviders = () => {
    /**
     * @type {ProvidersPayload}
     */
    const payload = {
      token: storeSession.tradeApi.accessToken,
      type: connectedOnly ? "connected" : "all",
      ro: true,
      copyTradersOnly,
      timeFrame,
      internalExchangeId,
    };

    tradeApi
      .providersGet(payload)
      .then((responseData) => {
        const uniqueProviders = uniqBy(responseData, "id");
        setProviders((s) => ({
          ...s,
          list: uniqueProviders,
        }));
        filterProviders(uniqueProviders);
      })
      .catch((e) => {
        dispatch(showErrorAlert(e));
      });
  };
  // Load providers at init and on timeframe change.
  useEffect(loadProviders, [
    timeFrame,
    connectedOnly,
    copyTradersOnly,
    storeSession.tradeApi.accessToken,
    internalExchangeId,
  ]);

  return {
    providers: providers.filteredList,
    timeFrame,
    setTimeFrame,
    coin,
    coins,
    setCoin,
    exchange,
    exchanges,
    setExchange,
    exchangeType,
    setExchangeType,
    exchangeTypes,
    sort,
    setSort,
    clearFilters,
    clearSort,
  };
};

export default useProvidersList;
