"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _components = require("@wordpress/components");

import { createElement } from "@wordpress/element";

var _createSlotFill = (0, _components.createSlotFill)('IsolatedFooter'),
    Fill = _createSlotFill.Fill,
    Slot = _createSlotFill.Slot;

var FooterSection = function FooterSection(_ref) {
  var children = _ref.children;
  return createElement(Fill, null, children);
};

FooterSection.Slot = function (props) {
  return createElement(Slot, null, function (fills) {
    return fills;
  });
};

var _default = FooterSection;
exports["default"] = _default;
//# sourceMappingURL=index.js.map