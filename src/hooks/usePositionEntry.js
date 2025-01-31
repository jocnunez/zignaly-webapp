import { useContext } from "react";
import { useFormContext } from "react-hook-form";
import TradingViewContext from "components/TradingTerminal/TradingView/TradingViewContext";

/**
 * @typedef {import("../services/tradeApiClient.types").PositionEntity} PositionEntity
 */

/**
 * @typedef {Object} PositionEntryHook
 * @property {function} getEntryPrice
 * @property {function} getEntrySize
 * @property {function} getEntrySizeQuote
 * @property {function} getEntryPricePercentChange
 * @property {function} getProfitPercentage
 */

/**
 * Provides dynamic resolution of position entry price.
 *
 * The entry price resolves as follows:
 * - From buyPrice on existing position.
 * - From strategy price input in new positions.
 *
 * @param {PositionEntity} positionEntity Position entity.
 * @returns {PositionEntryHook} Position entry hook object.
 */
function usePositionEntry(positionEntity) {
  const { watch } = useFormContext();
  const { lastPrice } = useContext(TradingViewContext);
  const strategyPrice = watch("price");
  const units = watch("units");
  const positionSize = watch("positionSize");
  const priceDifference = watch("priceDifference");
  const currentPrice = parseFloat(strategyPrice) || lastPrice;

  /**
   * Resolve position entry price for new or existing position.
   *
   * @returns {number} Entry price.
   */
  const getEntryPrice = () => {
    if (positionEntity) {
      return positionEntity.buyPrice;
    }

    return currentPrice;
  };

  /**
   * Get position price difference from entry price.
   *
   * @returns {number} Price difference.
   */
  const getEntryPricePercentChange = () => {
    // todo: priceDifference is always undefined, I think.
    if (positionEntity) {
      return priceDifference || positionEntity.priceDifference || 0;
    }

    return 0;
  };

  /**
   * Get position profit percentage.
   * Unlike priceDifference, it includes leverage and will be positive for profits in SHORT position.
   *
   * @returns {number} Price difference.
   */
  const getProfitPercentage = () => {
    if (positionEntity) {
      return positionEntity.profitPercentage;
    }

    return 0;
  };

  /**
   * Resolve position entry size (base) for new or existing position.
   *
   * @returns {number} Base entry size.
   */
  const getEntrySize = () => {
    if (positionEntity) {
      return positionEntity.amount;
    }

    return parseFloat(units) || 0;
  };

  /**
   * Resolve position entry size (quote) for new or existing position.
   *
   * @returns {number} Quote entry size.
   */
  const getEntrySizeQuote = () => {
    if (positionEntity) {
      return positionEntity.positionSizeQuote;
    }

    return parseFloat(positionSize) || 0;
  };

  return {
    getEntryPrice,
    getEntryPricePercentChange,
    getEntrySize,
    getEntrySizeQuote,
    getProfitPercentage,
  };
}

export default usePositionEntry;
