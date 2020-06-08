import React, { useEffect } from "react";
import { widget as TradingViewWidget } from "../../../tradingView/charting_library.min";
import "./TradingView.scss";
import { createWidgetOptions } from "../../../tradingView/dataFeedOptions";
import { useCoinRayDataFeedFactory } from "../../../hooks/useCoinRayDataFeedFactory";

const TradingView = () => {
  const dataFeed = useCoinRayDataFeedFactory();
  const createTradigViewWidget = () => {
    const widgetOptions = createWidgetOptions(dataFeed, "BTCUSDT");
    return new TradingViewWidget(widgetOptions);
  };

  const bootstrapWidget = () => {
    /**
     * @typedef {import("../../../tradingView/charting_library.min.js").IChartingLibraryWidget} Widget
     * @type {Widget|null} tvInstacne
     */
    let tvInstance = null;

    if (dataFeed) {
      tvInstance = createTradigViewWidget();
    }

    return () => {
      if (tvInstance) {
        tvInstance.remove();
      }
    };
  };

  // Create Trading View widget when data feed token is ready.
  useEffect(bootstrapWidget, [dataFeed]);

  return <div className="tradingView" id="trading_view_chart" />;
};

export default TradingView;
