export default [
  {
    id: "5b13fee5b233f6004cb8b884",
    name: "Binance",
    enabled: true,
    requiredAuthFields: ["key", "secret"],
    type: ["spot", "futures"],
    testNet: ["futures"],
  },
  {
    id: "5d66ba813e3b24c1867d2103",
    name: "BitMEX",
    enabled: true,
    requiredAuthFields: ["key", "secret"],
    type: ["futures"],
    testNet: ["futures"],
  },
  {
    id: "5dc14f932f2826b3b6970fa8",
    name: "KuCoin",
    enabled: true,
    requiredAuthFields: ["key", "secret", "password"],
    type: ["spot"],
    testNet: [],
  },
  {
    id: "5e662c1c3e3b24c186ed9c24",
    name: "Zignaly",
    enabled: true,
    requiredAuthFields: [],
    type: ["spot", "futures"],
    testNet: ["futures"],
  },
];
