"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _icons = require("@ant-design/icons");
var _componentNotes = _interopRequireDefault(require("@ivoyant/component-notes"));
var _componentCache = require("@ivoyant/component-cache");
var _componentMessageBus = require("@ivoyant/component-message-bus");
require("./styles.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
//CSS

const OpenCasesModal = /*#__PURE__*/_react.default.memo(props => {
  const {
    properties,
    setOpenCases,
    datasources
  } = props;
  const {
    visible,
    cmMode,
    opencasesResponse,
    updateOpenCaseWorkflow,
    agentId,
    setCreateCase,
    openErrMessage,
    setOpenErrMessage,
    caseSearchLoading,
    setSwitchToCreateCase
  } = properties;
  const selectedRow = _componentCache.cache.get('opencaseinfo');
  const [descriptionHTML, setDescriptionHTML] = (0, _react.useState)(_componentCache.cache.get('opencaseinfo')?.descriptionHTML || '');
  const [descriptionText, setDescriptionText] = (0, _react.useState)(_componentCache.cache.get('opencaseinfo')?.descriptionText || '');
  const [selectedRowData, setSelectedRowData] = (0, _react.useState)(selectedRow?.selectedRowData || undefined);
  const [selectedRowKeys, setSelectedRowKeys] = (0, _react.useState)(selectedRow?.selectedRowKeys || []);
  const [udateLoading, setUpdateLoading] = (0, _react.useState)(false);
  const contactInfo = _componentCache.cache.get('contactInfo');
  const CTN = window[window.sessionStorage?.tabId].NEW_CTN;
  const resetData = () => {
    setSelectedRowKeys(null);
    setSelectedRowData(null);
    setDescriptionHTML('');
    setDescriptionText('');
    setOpenErrMessage(null);
  };
  const handleOk = () => {
    resetData();
    setOpenCases(false);
  };
  const handleCancel = () => {
    // resetData();
    setOpenCases(false);
  };
  const handleClose = () => {
    resetData();
    setOpenCases(false);
  };

  // TO GO TO CREATE CASE MODAL
  const handleSwitchToCreateCase = () => {
    resetData();
    setCreateCase(true);
    setOpenCases(false);
    // keeping this for a different flow but if everything goes well can delete later
    // setSwitchToCreateCase(true);
  };

  // TO CONTROL UPDATE BUTTON
  const handleUpdateBtnDisable = () => {
    if (selectedRowKeys && descriptionText && descriptionText.length > 1) {
      return false;
    } else {
      return true;
    }
  };

  // DATA TO POPULATE TABLE
  const tableData = opencasesResponse && opencasesResponse?.map((item, i) => {
    const {
      caseId,
      caseHistory
    } = item;
    const caseCategory = caseHistory && caseHistory?.map(ch => {
      let data = {
        category: ch?.category,
        subCategory1: ch?.subCategory1,
        subCategory2: ch?.subCategory2,
        updatedBy: ch?.updatedBy,
        state: ch?.state,
        status: ch?.status
      };
      return data;
    })[0];
    return {
      caseId: caseId,
      caseCategory: caseCategory?.category,
      subCategory1: caseCategory?.subCategory1,
      subCategory2: caseCategory?.subCategory2,
      updatedBy: caseCategory?.updatedBy,
      state: caseCategory?.state,
      status: caseCategory?.status,
      key: caseId
    };
  });
  const handleDescriptionChange = (content, delta, source, editor) => {
    setDescriptionHTML(content);
    setDescriptionText(editor.getText());
  };

  //TABLE SPECIFIC

  const columns = [{
    title: 'CASE ID',
    dataIndex: 'caseId'
  }, {
    title: 'CATEGORY',
    dataIndex: 'caseCategory'
  }, {
    title: 'SUB-CATEGORY 1',
    dataIndex: 'subCategory1'
  }, {
    title: 'SUB-CATEGORY 2',
    dataIndex: 'subCategory2'
  }];
  const onSelectChange = (selectedRowKeys, selectedRows) => {
    setSelectedRowKeys(selectedRowKeys);
    setSelectedRowData(selectedRows);
    setDescriptionHTML('');
    setDescriptionText('');
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  //UPDATE API CALL RESPONSE
  const handleUpdateSelectedCaseResponse = (successStates, errorStates) => (subscriptionId, topic, eventData, closure) => {
    const status = eventData.value;
    const isSuccess = successStates.includes(status);
    const isFailure = errorStates.includes(status);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        resetData();
        setOpenCases(false);
        _componentCache.cache.put('opencaseinfo', '');
      }
      if (isFailure) {
        if (eventData?.event?.data?.response?.data?.causedBy) {
          setOpenErrMessage(eventData?.event?.data?.response?.data?.causedBy[0]?.message);
        } else {
          setOpenErrMessage(eventData?.event?.data?.response?.data?.message);
        }
      }
      setUpdateLoading(false);
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };

  //UPDATE API CALL
  const updateSelectedCase = () => {
    setUpdateLoading(true);
    const {
      workflow,
      datasource,
      responseMapping,
      successStates,
      errorStates
    } = updateOpenCaseWorkflow;
    const registrationId = workflow.concat('.').concat(agentId);
    _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleUpdateSelectedCaseResponse(successStates, errorStates));
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: registrationId,
        workflow: workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
      header: {
        registrationId: registrationId,
        workflow: workflow,
        eventType: 'SUBMIT'
      },
      body: {
        datasource: datasources[datasource],
        request: {
          body: {
            summary: descriptionHTML,
            caseId: selectedRowData[0]?.caseId,
            updatedBy: selectedRowData[0]?.updatedBy,
            status: selectedRowData[0]?.status,
            state: selectedRowData[0]?.state
          }
        },
        responseMapping
      }
    });
  };

  // CUSTOM FOOTER
  const updateCaseModalFooter = () => {
    let footer = [];
    let newCaseButton = /*#__PURE__*/_react.default.createElement(_antd.Button, {
      type: "default",
      onClick: handleSwitchToCreateCase,
      className: "primary-outlined-btn"
    }, "CREATE NEW CASE");
    let closeButton = /*#__PURE__*/_react.default.createElement(_antd.Button, {
      type: "default",
      onClick: handleClose
    }, "CLOSE");
    let updateButton = /*#__PURE__*/_react.default.createElement(_antd.Button, {
      type: selectedRowKeys ? descriptionText && descriptionText.length > 1 ? 'primary' : 'ghost' : 'ghost',
      disabled: handleUpdateBtnDisable(),
      onClick: updateSelectedCase,
      loading: udateLoading
    }, "UPDATE CASE");
    footer.push(newCaseButton);
    footer.push(updateButton);
    footer.push(closeButton);
    return footer;
  };

  // USEEFFECTS

  /**
   * Cacheing
   */

  (0, _react.useEffect)(() => {
    if (selectedRowKeys && descriptionHTML) {
      _componentCache.cache.put('opencaseinfo', {
        selectedRowKeys,
        descriptionHTML,
        descriptionText,
        selectedRowData
      });
    }
  }, [descriptionHTML, selectedRowKeys]);
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Modal, {
    title: "Update Case",
    open: visible,
    onOk: handleOk,
    onCancel: handleCancel,
    className: "open-cases-modal",
    closeIcon: /*#__PURE__*/_react.default.createElement(_icons.MinusOutlined, null),
    footer: null,
    width: 965,
    style: {
      top: '20px'
    }
  }, !cmMode && !contactInfo && !CTN ? /*#__PURE__*/_react.default.createElement("div", {
    className: "create-case-error"
  }, "Please authenticate or create contact. To use the create case") : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("article", null, /*#__PURE__*/_react.default.createElement("p", null, "A case already exists for this customer. Would you like to add a note to the existing case or create a new case? Select the case you want to update."), /*#__PURE__*/_react.default.createElement(_antd.Spin, {
    spinning: caseSearchLoading,
    tip: "Loading..."
  }, /*#__PURE__*/_react.default.createElement(_antd.Table, {
    rowSelection: {
      type: 'radio',
      ...rowSelection
    },
    columns: columns,
    dataSource: tableData,
    pagination: false
  })), selectedRowKeys && selectedRowKeys.length > 0 && /*#__PURE__*/_react.default.createElement("div", {
    className: "open-case-modal__notes-wrapper"
  }, /*#__PURE__*/_react.default.createElement(_componentNotes.default, {
    theme: "snow",
    value: descriptionHTML,
    onChange: handleDescriptionChange
  })), openErrMessage && /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    message: openErrMessage,
    type: "error",
    showIcon: true
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "open-cases-modal-footer-btn-group"
  }, updateCaseModalFooter())))));
});
var _default = OpenCasesModal;
exports.default = _default;
module.exports = exports.default;