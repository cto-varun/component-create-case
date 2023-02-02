"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = CreateCaseModal;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _reactDraggable = _interopRequireDefault(require("react-draggable"));
var _componentNotes = _interopRequireDefault(require("@ivoyant/component-notes"));
require("react-quill/dist/quill.snow.css");
var _icons = require("@ant-design/icons");
var _componentCache = require("@ivoyant/component-cache");
var _moment = _interopRequireDefault(require("moment"));
var _stateList = _interopRequireDefault(require("./stateList"));
var _shortid = _interopRequireDefault(require("shortid"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
require("./styles.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/* eslint-disable complexity */

const {
  Paragraph
} = _antd.Typography;
function CreateCaseModal(props) {
  const {
    properties,
    store,
    component,
    setCreateCase,
    datasources
  } = props;
  const params = component?.params;
  const [createCaseError, setCreateCaseError] = (0, _react.useState)('');
  const CTN = window[window.sessionStorage?.tabId].NEW_CTN;
  let BAN = window[window.sessionStorage?.tabId].NEW_BAN;

  // Get contact info from the cache
  const contactInfo = _componentCache.cache.get('contactInfo');
  let {
    profile,
    attId
  } = window[window.sessionStorage?.tabId].COM_IVOYANT_VARS;

  // const createCaseResponse = (response) => {
  //     if (
  //         response?.payload?.responseStatus >= 200 &&
  //         response?.payload?.responseStatus < 300
  //     ) {
  //         setCaseId(response.payload.caseId);
  //         window[window.sessionStorage?.tabId].createdCaseId =
  //             response.payload.caseId;
  //         setCreateCaseError('');
  //         setFinalStep(true);
  //     } else if (
  //         response?.payload?.responseStatus &&
  //         response?.payload?.responseStatus >= 400 &&
  //         response?.payload?.responseStatus < 500
  //     ) {
  //         setCreateCaseError(response?.payload?.causedBy[0]?.message);
  //     } else {
  //         let errorMessage = `ERROR - Something went wrong. Please try again later.`;
  //         if (
  //             response?.payload?.error &&
  //             typeof response?.payload?.error !== 'undefined'
  //         ) {
  //             errorMessage = response?.payload?.error;
  //         }
  //         setCreateCaseError(errorMessage);
  //     }
  // };

  // useEffect(() => {
  //     window[
  //         window.sessionStorage?.tabId
  //     ].createCaseResponse = createCaseResponse;
  //     return () => {
  //         if (window[window.sessionStorage?.tabId].createCaseResponse) {
  //             delete window[window.sessionStorage?.tabId].createCaseResponse;
  //         }
  //     };
  // }, []);

  if (store?.response?.['create-case-options']) {
    Object.assign(properties, store?.response?.['create-case-options']);
  }
  if (params) {
    Object.assign(properties, params);
  }
  const {
    visible,
    onCreate,
    values = {},
    options = {},
    caseCategories,
    casePriorities,
    caseAssignedTeam,
    casePrivileges,
    cmMode,
    caseCategoriesConfig,
    customerInfo
  } = properties;
  const {
    assignee = attId,
    priority: defaultPriority = 'Select Priority'
  } = values;
  const interactionChannelOptions = ['PHONE', 'CHAT'];
  const createCasePrevValues = sessionStorage.getItem('createCaseData') ? JSON.parse(sessionStorage.getItem('createCaseData')) : null;
  const [subject, setSubject] = (0, _react.useState)(createCasePrevValues?.subject || '');
  const [ctn, setCTN] = (0, _react.useState)(createCasePrevValues?.phoneNumber || '');
  const [ban, setBan] = (0, _react.useState)(createCasePrevValues?.billingAccountNumber || '');
  const [isCreatingCase, setIsCreatingCase] = (0, _react.useState)(false);
  const [caseId, setCaseId] = (0, _react.useState)(createCasePrevValues?.caseId || '');
  const [externalCaseId, setExternalCaseId] = (0, _react.useState)(createCasePrevValues?.externalCaseId || '');
  const [category, setCategory] = (0, _react.useState)(createCasePrevValues?.category || 'Select Category');
  const [subCategoryOne, setSubCategoryOne] = (0, _react.useState)('Select Category 1');
  const [subCategoryTwo, setSubCategoryTwo] = (0, _react.useState)(createCasePrevValues?.subCategory2 || 'Select Category 2');
  const [priority, setPriority] = (0, _react.useState)(createCasePrevValues?.priority || defaultPriority);
  const [descriptionText, setDescriptionText] = (0, _react.useState)(createCasePrevValues?.description || '');
  const [descriptionHTML, setDescriptionHTML] = (0, _react.useState)(createCasePrevValues?.description || '');
  const [assignedTeam, setAssignedTeam] = (0, _react.useState)(createCasePrevValues?.assignedTeam || 'Case Review');
  const [caseSource, setCaseSource] = (0, _react.useState)(createCasePrevValues?.caseSource || 'PHONE');
  const [isEdit, setIsEdit] = (0, _react.useState)(createCasePrevValues?.isEdit || true);
  const [finalStep, setFinalStep] = (0, _react.useState)(false);
  const [currentDateTime, setCurrentDateTime] = (0, _react.useState)((0, _moment.default)().format('YYYY-MM-DD hh:mm:ss a'));
  const [additionalProperties, setAdditionalProperties] = (0, _react.useState)(createCasePrevValues?.additionalProperties || {});
  const [caseCategoryFields, setCaseCategoryFields] = (0, _react.useState)(caseCategoriesConfig);
  const draggleRef = (0, _react.useRef)(null);
  const [disabled, setDisabled] = (0, _react.useState)(true);
  const [bounds, setBounds] = (0, _react.useState)({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0
  });

  // Privileges options of the profile
  const privilegeOptions = casePrivileges?.find(_ref => {
    let {
      name
    } = _ref;
    return name === profile;
  });
  // Dispatch queues from privileges if exists
  const dispatchQueues = privilegeOptions?.categories?.find(_ref2 => {
    let {
      name
    } = _ref2;
    return name === 'Dispatch';
  })?.dispatchTo;
  let dispatchCategories = caseCategories?.find(_ref3 => {
    let {
      name
    } = _ref3;
    return name === category;
  })?.dispatchTo?.map(name => {
    return {
      value: name,
      label: name
    };
  });

  // Queue options from caseprivileges or else caseAssignedTeam
  let intialQueueOptions = dispatchQueues ? dispatchQueues?.map(name => {
    return {
      value: name,
      label: name
    };
  }) : caseAssignedTeam?.map(category => {
    return {
      value: category?.name,
      label: category?.name
    };
  }) || [];
  var namesOfCategories = new Set(intialQueueOptions.map(_ref4 => {
    let {
      value
    } = _ref4;
    return value;
  }));
  const queueOptions = dispatchCategories?.length ? [...intialQueueOptions, ...dispatchCategories.filter(_ref5 => {
    let {
      value
    } = _ref5;
    return !namesOfCategories.has(value);
  })] : intialQueueOptions;
  const resetModal = updateCaseHistory => {
    setSubject('');
    setCreateCase(false);
    setCategory('Select Category');
    setSubCategoryOne('Select Category 1');
    setSubCategoryTwo('Select Category 2');
    setAssignedTeam('Case Review');
    setPriority(defaultPriority);
    setDescriptionHTML('');
    setDescriptionText('');
    setIsEdit(true);
    setFinalStep(false);
    setCTN('');
    setBan('');
    setCaseSource('PHONE');
    setAdditionalProperties({});
    if (updateCaseHistory && (!cmMode || ban === BAN)) {
      window[window.sessionStorage?.tabId].dispatchRedux('DATA_REQUEST', {
        dashboardID: 'history-board',
        datasources: ['360-case-history']
      });
    }
    sessionStorage.removeItem('createCaseData');
  };
  (0, _react.useEffect)(() => {
    if (createCasePrevValues?.category === category) {
      setSubCategoryOne(createCasePrevValues?.subCategory1 || 'Select Category 1');
      setSubCategoryTwo(createCasePrevValues?.subCategory2 || 'Select Category 2');
    } else {
      setSubCategoryOne('Select Category 1');
      setSubCategoryTwo('Select Category 2');
    }
    setAssignedTeam(caseCategories?.find(_ref6 => {
      let {
        name
      } = _ref6;
      return name === category;
    })?.dispatchTo?.length > 0 ? caseCategories?.find(_ref7 => {
      let {
        name
      } = _ref7;
      return name === category;
    })?.dispatchTo[0] : 'Case Review');
    if (category === 'EBB Emergency Broadband') {
      setAdditionalProperties(contactInfo ? {
        ...additionalProperties,
        phoneNumberInEbbp: contactInfo?.contactPhoneNumber,
        firstName: contactInfo?.name?.firstName,
        lastName: contactInfo?.name?.lastName
      } : cmMode ? {
        ...additionalProperties,
        phoneNumberInEbbp: ctn
      } : {
        ...additionalProperties,
        phoneNumberInEbbp: CTN,
        firstName: customerInfo?.firstName,
        lastName: customerInfo?.lastName,
        state: customerInfo?.adrStateCode
      });
    }
  }, [category]);
  (0, _react.useEffect)(() => {
    if (createCasePrevValues?.subCategory1 === subCategoryOne) {
      setSubCategoryTwo(createCasePrevValues?.subCategory2 || 'Select Category 2');
    } else {
      setSubCategoryTwo('Select Category 2');
    }
  }, [subCategoryOne]);
  const handleToggleEdit = isEdit => {
    setIsEdit(prevValue => isEdit ?? !prevValue);
    setCreateCaseError('');
  };
  const handleDescriptionChange = (content, delta, source, editor) => {
    setDescriptionHTML(content);
    setDescriptionText(editor.getText());
  };
  const billingAccountNumber = cmMode ? ban : BAN;
  function createCase() {
    if (onCreate) onCreate();
    const createdAt = (0, _moment.default)().format('YYYY-MM-DD HH:mm:ssZZ');
    const createCaseObject = {
      subject: `${category} -  ${subCategoryOne} - ${subCategoryTwo}`,
      category,
      subCategory1: subCategoryOne,
      subCategory2: subCategoryTwo,
      createdBy: attId,
      agentName: assignee,
      createdAt,
      description: descriptionHTML,
      priority,
      committedSLA: '0',
      phoneNumber: cmMode && ctn ? ctn : contactInfo ? contactInfo?.contactPhoneNumber : CTN,
      caseSource: caseSource,
      assignedTeam: assignedTeam
    };
    if (contactInfo) {
      createCaseObject.customerEmail = contactInfo?.emailAddress;
    } else if (billingAccountNumber) {
      createCaseObject.billingAccountNumber = billingAccountNumber;
    }
    if (Object.keys(additionalProperties).length) createCaseObject.additionalProperties = additionalProperties;
    setIsCreatingCase(true);
    const {
      workflow,
      datasource,
      successStates,
      errorStates,
      responseMapping
    } = properties?.createCaseWorkflow;
    const registrationId = `${workflow}`;
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: registrationId,
        workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleResponse(successStates, errorStates));
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
      header: {
        registrationId: registrationId,
        workflow,
        eventType: 'SUBMIT'
      },
      body: {
        datasource: datasources[datasource],
        request: {
          body: {
            ...createCaseObject
          }
        },
        responseMapping
      }
    });
  }
  const handleResponse = (successStates, errorStates) => (subscriptionId, topic, eventData, closure) => {
    const state = eventData.value;
    const isSuccess = successStates.includes(state);
    const isFailure = errorStates.includes(state);
    if (isSuccess || isFailure) {
      const response = eventData.event.data.data;
      if (isSuccess) {
        setExternalCaseId(response?.externalCaseId);
        setCaseId(response.caseId);
        setCreateCaseError('');
        setFinalStep(true);
      }
      if (isFailure) {
        setCreateCaseError(eventData.event.data.message || 'ERROR - Something went wrong. Please try again later!');
      }
      setIsCreatingCase(false);
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  const handleCancel = () => {
    let values = {
      subject,
      category,
      subCategory1: subCategoryOne,
      subCategory2: subCategoryTwo,
      createdBy: attId,
      agentName: assignee,
      description: descriptionHTML,
      priority,
      committedSLA: '0',
      billingAccountNumber: billingAccountNumber,
      phoneNumber: cmMode ? ctn : CTN,
      caseSource: caseSource,
      isEdit: isEdit,
      additionalProperties: additionalProperties
    };
    sessionStorage.setItem('createCaseData', JSON.stringify(values));
    setCreateCase(false);
  };
  const handleStart = (event, uiData) => {
    const {
      clientWidth,
      clientHeight
    } = window[window.sessionStorage?.tabId].document?.documentElement;
    const targetRect = draggleRef?.current?.getBoundingClientRect();
    setBounds({
      left: -targetRect?.left + uiData?.x,
      right: clientWidth - (targetRect?.right - uiData?.x),
      top: -targetRect?.top + uiData?.y,
      bottom: clientHeight - (targetRect?.bottom - uiData?.y)
    });
  };
  const handleChangeAdditionalProps = (value, key, type) => {
    if (type === 'DatePicker') {
      value = (0, _moment.default)().format('YYYY-MM-DD HH:mm:ssZZ');
    }
    setAdditionalProperties({
      ...additionalProperties,
      [key]: value
    });
  };
  function getRequiredFields(field) {
    let required = false;
    let requiredFields = ['category', 'subCategoryOne', 'subCategoryTwo', 'priority', 'descriptionText'];
    if (properties?.categoryConditionsForImei?.includes(category)) {
      requiredFields.push('imei');
    }
    if (properties?.categoryConditionsForCTN?.includes(category)) {
      requiredFields.push('ctn');
    }
    if (requiredFields?.includes(field)) {
      required = true;
    }
    return required;
  }
  function renderRequiredLabel(label, field) {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "d-flex"
    }, label, getRequiredFields(field) ? /*#__PURE__*/_react.default.createElement("div", {
      className: "text-danger"
    }, "*") : null);
  }
  function renderConfirmButton() {
    let renderButton = false;
    if (category !== 'Select Category' && subCategoryOne !== 'Select Category 1' && subCategoryTwo !== 'Select Category 2' && priority !== 'Select Priority' && descriptionText.length > 1) {
      renderButton = true;
      if (properties?.categoryConditionsForImei?.includes(category) && !additionalProperties?.imei) {
        renderButton = false;
      }
      if (properties?.categoryConditionsForCTN?.includes(category) && cmMode && !ctn) {
        renderButton = false;
      }
    }
    return renderButton;
  }
  return /*#__PURE__*/_react.default.createElement(_antd.Modal, {
    className: "create-case-modal react-draggable",
    title: /*#__PURE__*/_react.default.createElement("div", {
      className: "create-case-header",
      style: {
        width: '100%',
        cursor: 'move'
      },
      onMouseOver: () => {
        if (disabled) {
          setDisabled(false);
        }
      },
      onMouseOut: () => setDisabled(true),
      onFocus: () => {},
      onBlur: () => {}
    }, "Create Case"),
    open: visible,
    onCancel: () => handleCancel(),
    closeIcon: /*#__PURE__*/_react.default.createElement(_icons.MinusOutlined, null),
    footer: null,
    width: 750,
    modalRender: modal => /*#__PURE__*/_react.default.createElement(_reactDraggable.default, {
      disabled: disabled,
      bounds: bounds,
      onStart: (event, uiData) => handleStart(event, uiData)
    }, /*#__PURE__*/_react.default.createElement("div", {
      ref: draggleRef
    }, modal))
  }, /*#__PURE__*/_react.default.createElement(_antd.Form, {
    layout: "vertical"
  }, isEdit ? /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex flex-column"
  }, !cmMode && !contactInfo && !CTN ? /*#__PURE__*/_react.default.createElement("div", {
    className: "create-case-error"
  }, "Please authenticate or create contact. To use the create case") : /*#__PURE__*/_react.default.createElement(_antd.Space, {
    direction: "vertical",
    size: "large"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex flex-row justify-content-between case-text"
  }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "case-heading"
  }, "CSR ID"), /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "case-heading-detail"
  }, attId)), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "case-heading"
  }, "Case Creation date & time"), /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "case-heading-detail"
  }, currentDateTime)), !cmMode && !contactInfo && CTN && /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "case-heading"
  }, "CTN"), /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "case-heading-detail"
  }, CTN)), !cmMode && !contactInfo && BAN && /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "case-heading"
  }, "BAN"), /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "case-heading-detail"
  }, BAN))), /*#__PURE__*/_react.default.createElement("div", {
    className: "select-row"
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: renderRequiredLabel('Category', 'category')
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    value: category,
    onChange: setCategory,
    style: {
      width: 268
    },
    popupClassName: "disable-scroll"
  }, caseCategories.length > 0 && caseCategories.map(option => /*#__PURE__*/_react.default.createElement(_antd.Select.Option, {
    value: option.name,
    key: _shortid.default.generate()
  }, option.name)))), category !== 'Select Category' && /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: renderRequiredLabel('Sub category 1', 'subCategoryOne')
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    value: subCategoryOne,
    onChange: setSubCategoryOne,
    style: {
      width: 346
    }
  }, caseCategories.find(c => c.name === category)?.categories.map(option => /*#__PURE__*/_react.default.createElement(_antd.Select.Option, {
    value: option.name,
    key: _shortid.default.generate()
  }, option.name))))), /*#__PURE__*/_react.default.createElement("div", {
    className: "select-row"
  }, subCategoryOne !== 'Select Category 1' && /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: renderRequiredLabel('Sub category 2', 'subCategoryTwo')
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    value: subCategoryTwo,
    onChange: setSubCategoryTwo,
    style: {
      width: 376
    }
  }, caseCategories.find(c => c.name === category)?.categories.find(sco => sco.name === subCategoryOne)?.categories.map(option => /*#__PURE__*/_react.default.createElement(_antd.Select.Option, {
    value: option.name,
    key: _shortid.default.generate()
  }, option.name)))), /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: renderRequiredLabel('Priority', 'priority')
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    placeholder: 'Select Priority',
    onChange: setPriority,
    style: {
      width: 144
    },
    value: priority
  }, casePriorities.length > 0 && casePriorities.map(option => /*#__PURE__*/_react.default.createElement(_antd.Select.Option, {
    value: option.name,
    key: _shortid.default.generate()
  }, option.name)))), /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: "Case source"
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    placeholder: 'Select Case Source',
    onChange: setCaseSource,
    style: {
      width: 118
    },
    value: caseSource
  }, interactionChannelOptions.map(option => /*#__PURE__*/_react.default.createElement(_antd.Select.Option, {
    value: option,
    key: _shortid.default.generate()
  }, option)))), caseCategories.length === 0 && /*#__PURE__*/_react.default.createElement("div", {
    className: "create-case-error"
  }, "Error loading categories or subcategories."), casePriorities.length === 0 && /*#__PURE__*/_react.default.createElement("div", {
    className: "create-case-error"
  }, "Error loading priorities.")), cmMode && !contactInfo && /*#__PURE__*/_react.default.createElement(_antd.Row, {
    style: {
      width: '100%'
    },
    gutter: [8, 0]
  }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    sm: 12
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "select-row"
  }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
    placeholder: getRequiredFields('ctn') ? 'Affected CTN*' : 'CTN',
    onChange: e => setCTN(e.target.value),
    value: ctn
  }))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    sm: 12
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "select-row"
  }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
    placeholder: "Enter BAN",
    onChange: e => setBan(e.target.value),
    value: ban
  })))), /*#__PURE__*/_react.default.createElement(_antd.Row, null, caseCategoryFields[category]?.map(_ref8 => {
    let {
      type,
      label,
      name,
      options,
      ...props
    } = _ref8;
    switch (type) {
      case 'Input':
        return /*#__PURE__*/_react.default.createElement(_antd.Col, {
          sm: 12,
          lg: 8
        }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
          label: name === 'imei' ? renderRequiredLabel(label, 'imei') : label
        }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
          autoComplete: "newPassword",
          style: {
            width: 220,
            marginTop: 8,
            marginRight: 8
          },
          value: additionalProperties[name],
          name: name,
          label: label,
          onChange: e => handleChangeAdditionalProps(e.target.value, name)
          // {...props}
        })));

      case 'DatePicker':
        return /*#__PURE__*/_react.default.createElement(_antd.Col, {
          sm: 12,
          lg: 8
        }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
          label: label
        }, /*#__PURE__*/_react.default.createElement(_antd.DatePicker, {
          placeholder: label,
          format: "YYYY-MM-DD h:mm A",
          use12Hours: true,
          showTime: true,
          defaultValue: additionalProperties[name] ? (0, _moment.default)(new Date(additionalProperties[name])) : '',
          onChange: date => handleChangeAdditionalProps(date, name, type),
          style: {
            width: 220,
            marginTop: 8,
            marginRight: 8
          }
        })));
      case 'Select':
        const newOptions = name === 'state' ? _stateList.default : options;
        return /*#__PURE__*/_react.default.createElement(_antd.Col, {
          sm: 12,
          lg: 8
        }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
          label: label,
          style: {
            width: 220,
            marginTop: 8,
            marginRight: 8
          }
        }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
          autoComplete: "newPassword",
          value: additionalProperties[name],
          showSearch: true,
          optionFilterProp: "children",
          onChange: value => handleChangeAdditionalProps(value, name),
          filterOption: (input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }, newOptions.map(option => /*#__PURE__*/_react.default.createElement(_antd.Select.Option, {
          value: option.value,
          key: _shortid.default.generate()
        }, option.label)))));
      case 'CheckBox':
        return /*#__PURE__*/_react.default.createElement(_antd.Col, {
          sm: 12,
          lg: 8
        }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
          style: {
            width: 220,
            marginTop: 36,
            marginRight: 8
          }
        }, /*#__PURE__*/_react.default.createElement(_antd.Checkbox, {
          checked: additionalProperties[name] === 'true' ? true : false,
          onChange: e => handleChangeAdditionalProps(e.target.checked ? 'true' : 'false', name)
        }, label)));
      default:
        return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null);
    }
  })), /*#__PURE__*/_react.default.createElement(_antd.Row, {
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    sm: 24
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: "Subject"
  }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
    placeholder: "Case Subject",
    disabled: true,
    value: `${category} -  ${subCategoryOne} - ${subCategoryTwo}`
  })))), /*#__PURE__*/_react.default.createElement("div", {
    style: {
      height: '11rem'
    }
  }, renderRequiredLabel('Required', 'descriptionText'), /*#__PURE__*/_react.default.createElement(_componentNotes.default, {
    style: {
      height: '8rem',
      borderLeft: 'none',
      borderRight: 'none'
    },
    theme: "snow",
    value: descriptionHTML,
    onChange: handleDescriptionChange
  })), renderConfirmButton() ? /*#__PURE__*/_react.default.createElement(_antd.Button, {
    style: {
      background: '#52c41a',
      border: 'none'
    },
    type: "primary",
    onClick: () => handleToggleEdit()
  }, "Proceed To Confirm") : null)) : finalStep ? /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    xs: 24,
    style: {
      paddingBottom: '1rem'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    xs: 2
  }, /*#__PURE__*/_react.default.createElement(_icons.FileDoneOutlined, {
    style: {
      fontSize: '35px',
      height: '50px',
      width: '50px',
      color: '#52C41A'
    }
  })), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    xs: 21
  }, /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    xs: 24
  }, "A new case has successfully created."), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    xs: 24
  }, /*#__PURE__*/_react.default.createElement(Paragraph, {
    style: {
      display: 'flex',
      marginTop: 12
    },
    copyable: {
      text: caseId
    }
  }, /*#__PURE__*/_react.default.createElement("div", null, "Case ID : ", caseId))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    xs: 24
  }, /*#__PURE__*/_react.default.createElement(Paragraph, {
    style: {
      display: 'flex'
    },
    copyable: {
      text: externalCaseId
    }
  }, /*#__PURE__*/_react.default.createElement("div", null, "External Case ID :", ' ', externalCaseId))))))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    xs: 24
  }, /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Space, {
    size: "middle"
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    style: {
      backgroundColor: '#fff',
      color: '#7CB305',
      border: '1px solid #52C41A'
    },
    type: "primary",
    onClick: () => resetModal(true)
  }, "Close"))))) : /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex flex-column"
  }, /*#__PURE__*/_react.default.createElement(_antd.Space, {
    direction: "vertical",
    size: "large"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex flex-row justify-content-between case-text"
  }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "case-heading"
  }, "CSR ID"), /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "case-heading-detail"
  }, attId)), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "case-heading"
  }, "Case Creation date & time"), /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "case-heading-detail"
  }, currentDateTime)), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "case-heading"
  }, "Priority"), /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "case-heading-detail"
  }, /*#__PURE__*/_react.default.createElement(_antd.Tag, {
    color: "warning"
  }, priority))), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "case-heading"
  }, "Case Source"), /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "case-heading-detail"
  }, caseSource)), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "case-heading"
  }, "CTN"), /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "case-heading-detail"
  }, contactInfo ? contactInfo?.contactPhoneNumber : cmMode ? ctn : CTN)), !contactInfo && /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "case-heading"
  }, "BAN"), /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "case-heading-detail"
  }, billingAccountNumber))), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Space, {
    size: 10,
    style: {
      marginTop: 16
    }
  }, category && /*#__PURE__*/_react.default.createElement(_antd.Tag, {
    color: "#F6FFED",
    className: "stat-tab"
  }, category), subCategoryOne && /*#__PURE__*/_react.default.createElement(_antd.Tag, {
    color: "#E6F7FF",
    className: "stat-tab"
  }, subCategoryOne)), /*#__PURE__*/_react.default.createElement(_antd.Space, {
    size: 10,
    style: {
      marginTop: 8
    }
  }, subCategoryTwo && /*#__PURE__*/_react.default.createElement(_antd.Tag, {
    color: "#E6F7FF",
    className: "stat-tab"
  }, subCategoryTwo)), /*#__PURE__*/_react.default.createElement("hr", {
    style: {
      width: '100%',
      marginTop: 10,
      marginBottom: 0
    }
  })), /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    xs: 3,
    className: "confirmpage-heading"
  }, "Subject:"), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    xs: 21,
    className: "confirmpage-text"
  }, `${category} -  ${subCategoryOne} - ${subCategoryTwo}`)), /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    xs: 24,
    className: "confirmpage-heading"
  }, "Description"), /*#__PURE__*/_react.default.createElement("div", {
    xs: 24,
    className: "confirmpage-text",
    dangerouslySetInnerHTML: {
      __html: descriptionHTML
    }
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "case-queue"
  }, /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "case-heading"
  }, "Queue (Optional)"), /*#__PURE__*/_react.default.createElement(_antd.Select, {
    value: assignedTeam,
    onChange: setAssignedTeam,
    style: {
      width: 'auto',
      minWidth: 200
    },
    placeholder: "Select to assign team"
  }, queueOptions?.map(_ref9 => {
    let {
      value
    } = _ref9;
    return /*#__PURE__*/_react.default.createElement(_antd.Select.Option, {
      value: value,
      key: _shortid.default.generate()
    }, value);
  }))), /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex flex-row align-items-center justify-content-start action-buttons"
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    style: {
      background: '#52c41a',
      border: 'none'
    },
    type: "primary",
    onClick: createCase,
    loading: isCreatingCase
  }, "Create Case"), /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: "default",
    onClick: () => handleToggleEdit()
  }, "Edit", /*#__PURE__*/_react.default.createElement(_icons.EditOutlined, null))), createCaseError !== '' && /*#__PURE__*/_react.default.createElement("div", {
    className: "create-case-error"
  }, createCaseError))), !finalStep && /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "footer"
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    style: {
      background: '#D9D9D9',
      borderRadius: '2px'
    },
    type: "default",
    onClick: () => resetModal()
  }, "Cancel"))));
}
module.exports = exports.default;