/* eslint-disable complexity */
import React, { useState, useEffect, useRef } from 'react';
import {
    Modal,
    Row,
    Col,
    Select,
    Space,
    Tag,
    Button,
    Input,
    Form,
    DatePicker,
    Checkbox,
    Typography,
} from 'antd';
import Draggable from 'react-draggable';
import Notes from '@ivoyant/component-notes';
import 'react-quill/dist/quill.snow.css';
import {
    EditOutlined,
    FileDoneOutlined,
    MinusOutlined,
} from '@ant-design/icons';
import { cache } from '@ivoyant/component-cache';
import moment from 'moment';
import stateList from './stateList';
import shortid from 'shortid';
import { MessageBus } from '@ivoyant/component-message-bus';

const { Paragraph } = Typography;

import './styles.css';

export default function CreateCaseModal(props) {
    const { properties, store, component, setCreateCase, datasources } = props;

    const params = component?.params;
    const [createCaseError, setCreateCaseError] = useState('');
    const CTN = window[window.sessionStorage?.tabId].NEW_CTN;
    let BAN = window[window.sessionStorage?.tabId].NEW_BAN;

    // Get contact info from the cache
    const contactInfo = cache.get('contactInfo');

    let { profile, attId } = window[
        window.sessionStorage?.tabId
    ].COM_IVOYANT_VARS;

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
        customerInfo,
    } = properties;

    const {
        assignee = attId,
        priority: defaultPriority = 'Select Priority',
    } = values;

    const interactionChannelOptions = ['PHONE', 'CHAT'];
    const createCasePrevValues = sessionStorage.getItem('createCaseData')
        ? JSON.parse(sessionStorage.getItem('createCaseData'))
        : null;

    const [subject, setSubject] = useState(createCasePrevValues?.subject || '');

    const [ctn, setCTN] = useState(createCasePrevValues?.phoneNumber || '');
    const [ban, setBan] = useState(
        createCasePrevValues?.billingAccountNumber || ''
    );
    const [isCreatingCase, setIsCreatingCase] = useState(false);
    const [caseId, setCaseId] = useState(createCasePrevValues?.caseId || '');
    const [externalCaseId, setExternalCaseId] = useState(
        createCasePrevValues?.externalCaseId || ''
    );
    const [category, setCategory] = useState(
        createCasePrevValues?.category || 'Select Category'
    );
    const [subCategoryOne, setSubCategoryOne] = useState('Select Category 1');
    const [subCategoryTwo, setSubCategoryTwo] = useState(
        createCasePrevValues?.subCategory2 || 'Select Category 2'
    );
    const [priority, setPriority] = useState(
        createCasePrevValues?.priority || defaultPriority
    );
    const [descriptionText, setDescriptionText] = useState(
        createCasePrevValues?.description || ''
    );
    const [descriptionHTML, setDescriptionHTML] = useState(
        createCasePrevValues?.description || ''
    );
    const [assignedTeam, setAssignedTeam] = useState(
        createCasePrevValues?.assignedTeam || 'Case Review'
    );
    const [caseSource, setCaseSource] = useState(
        createCasePrevValues?.caseSource || 'PHONE'
    );
    const [isEdit, setIsEdit] = useState(createCasePrevValues?.isEdit || true);
    const [finalStep, setFinalStep] = useState(false);
    const [currentDateTime, setCurrentDateTime] = useState(
        moment().format('YYYY-MM-DD hh:mm:ss a')
    );

    const [additionalProperties, setAdditionalProperties] = useState(
        createCasePrevValues?.additionalProperties || {}
    );

    const [caseCategoryFields, setCaseCategoryFields] = useState(
        caseCategoriesConfig
    );

    const draggleRef = useRef(null);
    const [disabled, setDisabled] = useState(true);
    const [bounds, setBounds] = useState({
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
    });

    // Privileges options of the profile
    const privilegeOptions = casePrivileges?.find(
        ({ name }) => name === profile
    );
    // Dispatch queues from privileges if exists
    const dispatchQueues = privilegeOptions?.categories?.find(
        ({ name }) => name === 'Dispatch'
    )?.dispatchTo;

    let dispatchCategories = caseCategories
        ?.find(({ name }) => name === category)
        ?.dispatchTo?.map((name) => {
            return { value: name, label: name };
        });

    // Queue options from caseprivileges or else caseAssignedTeam
    let intialQueueOptions = dispatchQueues
        ? dispatchQueues?.map((name) => {
              return { value: name, label: name };
          })
        : caseAssignedTeam?.map((category) => {
              return { value: category?.name, label: category?.name };
          }) || [];

    var namesOfCategories = new Set(
        intialQueueOptions.map(({ value }) => value)
    );

    const queueOptions = dispatchCategories?.length
        ? [
              ...intialQueueOptions,
              ...dispatchCategories.filter(
                  ({ value }) => !namesOfCategories.has(value)
              ),
          ]
        : intialQueueOptions;

    const resetModal = (updateCaseHistory) => {
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
                datasources: ['360-case-history'],
            });
        }
        sessionStorage.removeItem('createCaseData');
    };
    useEffect(() => {
        if (createCasePrevValues?.category === category) {
            setSubCategoryOne(
                createCasePrevValues?.subCategory1 || 'Select Category 1'
            );
            setSubCategoryTwo(
                createCasePrevValues?.subCategory2 || 'Select Category 2'
            );
        } else {
            setSubCategoryOne('Select Category 1');
            setSubCategoryTwo('Select Category 2');
        }
        setAssignedTeam(
            caseCategories?.find(({ name }) => name === category)?.dispatchTo
                ?.length > 0
                ? caseCategories?.find(({ name }) => name === category)
                      ?.dispatchTo[0]
                : 'Case Review'
        );

        if (category === 'EBB Emergency Broadband') {
            setAdditionalProperties(
                contactInfo
                    ? {
                          ...additionalProperties,
                          phoneNumberInEbbp: contactInfo?.contactPhoneNumber,
                          firstName: contactInfo?.name?.firstName,
                          lastName: contactInfo?.name?.lastName,
                      }
                    : cmMode
                    ? {
                          ...additionalProperties,
                          phoneNumberInEbbp: ctn,
                      }
                    : {
                          ...additionalProperties,
                          phoneNumberInEbbp: CTN,
                          firstName: customerInfo?.firstName,
                          lastName: customerInfo?.lastName,
                          state: customerInfo?.adrStateCode,
                      }
            );
        }
    }, [category]);

    useEffect(() => {
        if (createCasePrevValues?.subCategory1 === subCategoryOne) {
            setSubCategoryTwo(
                createCasePrevValues?.subCategory2 || 'Select Category 2'
            );
        } else {
            setSubCategoryTwo('Select Category 2');
        }
    }, [subCategoryOne]);

    const handleToggleEdit = (isEdit) => {
        setIsEdit((prevValue) => isEdit ?? !prevValue);
        setCreateCaseError('');
    };
    const handleDescriptionChange = (content, delta, source, editor) => {
        setDescriptionHTML(content);
        setDescriptionText(editor.getText());
    };

    const billingAccountNumber = cmMode ? ban : BAN;

    function createCase() {
        if (onCreate) onCreate();
        const createdAt = moment().format('YYYY-MM-DD HH:mm:ssZZ');
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
            phoneNumber:
                cmMode && ctn
                    ? ctn
                    : contactInfo
                    ? contactInfo?.contactPhoneNumber
                    : CTN,
            caseSource: caseSource,
            assignedTeam: assignedTeam,
        };

        if (contactInfo) {
            createCaseObject.customerEmail = contactInfo?.emailAddress;
        } else if (billingAccountNumber) {
            createCaseObject.billingAccountNumber = billingAccountNumber;
        }
        if (Object.keys(additionalProperties).length)
            createCaseObject.additionalProperties = additionalProperties;
        setIsCreatingCase(true);
        const {
            workflow,
            datasource,
            successStates,
            errorStates,
            responseMapping,
        } = properties?.createCaseWorkflow;
        const registrationId = `${workflow}`;
        MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
            header: {
                registrationId: registrationId,
                workflow,
                eventType: 'INIT',
            },
        });
        MessageBus.subscribe(
            registrationId,
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            handleResponse(successStates, errorStates)
        );
        MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
            header: {
                registrationId: registrationId,
                workflow,
                eventType: 'SUBMIT',
            },
            body: {
                datasource: datasources[datasource],
                request: {
                    body: {
                        ...createCaseObject,
                    },
                },
                responseMapping,
            },
        });
    }

    const handleResponse = (successStates, errorStates) => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
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
                setCreateCaseError(
                    eventData.event.data.message ||
                        'ERROR - Something went wrong. Please try again later!'
                );
            }
            setIsCreatingCase(false);
            MessageBus.unsubscribe(subscriptionId);
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
            additionalProperties: additionalProperties,
        };
        sessionStorage.setItem('createCaseData', JSON.stringify(values));
        setCreateCase(false);
    };

    const handleStart = (event, uiData) => {
        const { clientWidth, clientHeight } = window[
            window.sessionStorage?.tabId
        ].document?.documentElement;
        const targetRect = draggleRef?.current?.getBoundingClientRect();
        setBounds({
            left: -targetRect?.left + uiData?.x,
            right: clientWidth - (targetRect?.right - uiData?.x),
            top: -targetRect?.top + uiData?.y,
            bottom: clientHeight - (targetRect?.bottom - uiData?.y),
        });
    };

    const handleChangeAdditionalProps = (value, key, type) => {
        if (type === 'DatePicker') {
            value = moment().format('YYYY-MM-DD HH:mm:ssZZ');
        }
        setAdditionalProperties({
            ...additionalProperties,
            [key]: value,
        });
    };

    function getRequiredFields(field) {
        let required = false;
        let requiredFields = [
            'category',
            'subCategoryOne',
            'subCategoryTwo',
            'priority',
            'descriptionText',
        ];
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
        return (
            <div className="d-flex">
                {label}
                {getRequiredFields(field) ? (
                    <div className="text-danger">*</div>
                ) : null}
            </div>
        );
    }

    function renderConfirmButton() {
        let renderButton = false;
        if (
            category !== 'Select Category' &&
            subCategoryOne !== 'Select Category 1' &&
            subCategoryTwo !== 'Select Category 2' &&
            priority !== 'Select Priority' &&
            descriptionText.length > 1
        ) {
            renderButton = true;
            if (
                properties?.categoryConditionsForImei?.includes(category) &&
                !additionalProperties?.imei
            ) {
                renderButton = false;
            }
            if (
                properties?.categoryConditionsForCTN?.includes(category) &&
                cmMode &&
                !ctn
            ) {
                renderButton = false;
            }
        }
        return renderButton;
    }
    return (
        <Modal
            className="create-case-modal react-draggable"
            title={
                <div
                    className="create-case-header"
                    style={{
                        width: '100%',
                        cursor: 'move',
                    }}
                    onMouseOver={() => {
                        if (disabled) {
                            setDisabled(false);
                        }
                    }}
                    onMouseOut={() => setDisabled(true)}
                    onFocus={() => {}}
                    onBlur={() => {}}
                >
                    Create Case
                </div>
            }
            open={visible}
            onCancel={() => handleCancel()}
            closeIcon={<MinusOutlined />}
            footer={null}
            width={750}
            modalRender={(modal) => (
                <Draggable
                    disabled={disabled}
                    bounds={bounds}
                    onStart={(event, uiData) => handleStart(event, uiData)}
                >
                    <div ref={draggleRef}>{modal}</div>
                </Draggable>
            )}
        >
            <Form layout="vertical">
                {isEdit ? (
                    <div className="d-flex flex-column">
                        {!cmMode && !contactInfo && !CTN ? (
                            <div className="create-case-error">
                                Please authenticate or create contact. To use
                                the create case
                            </div>
                        ) : (
                            <Space direction="vertical" size="large">
                                <div className="d-flex flex-row justify-content-between case-text">
                                    <div>
                                        <Row className="case-heading">
                                            CSR ID
                                        </Row>
                                        <Row className="case-heading-detail">
                                            {attId}
                                        </Row>
                                    </div>
                                    <div>
                                        <Row className="case-heading">
                                            Case Creation date & time
                                        </Row>
                                        <Row className="case-heading-detail">
                                            {currentDateTime}
                                        </Row>
                                    </div>
                                    {!cmMode && !contactInfo && CTN && (
                                        <div>
                                            <Row className="case-heading">
                                                CTN
                                            </Row>
                                            <Row className="case-heading-detail">
                                                {CTN}
                                            </Row>
                                        </div>
                                    )}
                                    {!cmMode && !contactInfo && BAN && (
                                        <div>
                                            <Row className="case-heading">
                                                BAN
                                            </Row>
                                            <Row className="case-heading-detail">
                                                {BAN}
                                            </Row>
                                        </div>
                                    )}
                                </div>
                                <div className="select-row">
                                    <Form.Item
                                        label={renderRequiredLabel(
                                            'Category',
                                            'category'
                                        )}
                                    >
                                        <Select
                                            value={category}
                                            onChange={setCategory}
                                            style={{ width: 268 }}
                                            popupClassName="disable-scroll"
                                        >
                                            {caseCategories.length > 0 &&
                                                caseCategories.map((option) => (
                                                    <Select.Option
                                                        value={option.name}
                                                        key={shortid.generate()}
                                                    >
                                                        {option.name}
                                                    </Select.Option>
                                                ))}
                                        </Select>
                                    </Form.Item>
                                    {category !== 'Select Category' && (
                                        <Form.Item
                                            label={renderRequiredLabel(
                                                'Sub category 1',
                                                'subCategoryOne'
                                            )}
                                        >
                                            <Select
                                                value={subCategoryOne}
                                                onChange={setSubCategoryOne}
                                                style={{ width: 346 }}
                                            >
                                                {caseCategories
                                                    .find(
                                                        (c) =>
                                                            c.name === category
                                                    )
                                                    ?.categories.map(
                                                        (option) => (
                                                            <Select.Option
                                                                value={
                                                                    option.name
                                                                }
                                                                key={shortid.generate()}
                                                            >
                                                                {option.name}
                                                            </Select.Option>
                                                        )
                                                    )}
                                            </Select>
                                        </Form.Item>
                                    )}
                                </div>
                                <div className="select-row">
                                    {subCategoryOne !== 'Select Category 1' && (
                                        <Form.Item
                                            label={renderRequiredLabel(
                                                'Sub category 2',
                                                'subCategoryTwo'
                                            )}
                                        >
                                            <Select
                                                value={subCategoryTwo}
                                                onChange={setSubCategoryTwo}
                                                style={{ width: 376 }}
                                            >
                                                {caseCategories
                                                    .find(
                                                        (c) =>
                                                            c.name === category
                                                    )
                                                    ?.categories.find(
                                                        (sco) =>
                                                            sco.name ===
                                                            subCategoryOne
                                                    )
                                                    ?.categories.map(
                                                        (option) => (
                                                            <Select.Option
                                                                value={
                                                                    option.name
                                                                }
                                                                key={shortid.generate()}
                                                            >
                                                                {option.name}
                                                            </Select.Option>
                                                        )
                                                    )}
                                            </Select>
                                        </Form.Item>
                                    )}
                                    <Form.Item
                                        label={renderRequiredLabel(
                                            'Priority',
                                            'priority'
                                        )}
                                    >
                                        <Select
                                            placeholder={'Select Priority'}
                                            onChange={setPriority}
                                            style={{ width: 144 }}
                                            value={priority}
                                        >
                                            {casePriorities.length > 0 &&
                                                casePriorities.map((option) => (
                                                    <Select.Option
                                                        value={option.name}
                                                        key={shortid.generate()}
                                                    >
                                                        {option.name}
                                                    </Select.Option>
                                                ))}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item label="Case source">
                                        <Select
                                            placeholder={'Select Case Source'}
                                            onChange={setCaseSource}
                                            style={{ width: 118 }}
                                            value={caseSource}
                                        >
                                            {interactionChannelOptions.map(
                                                (option) => (
                                                    <Select.Option
                                                        value={option}
                                                        key={shortid.generate()}
                                                    >
                                                        {option}
                                                    </Select.Option>
                                                )
                                            )}
                                        </Select>
                                    </Form.Item>
                                    {caseCategories.length === 0 && (
                                        <div className="create-case-error">
                                            Error loading categories or
                                            subcategories.
                                        </div>
                                    )}
                                    {casePriorities.length === 0 && (
                                        <div className="create-case-error">
                                            Error loading priorities.
                                        </div>
                                    )}
                                </div>
                                {cmMode && !contactInfo && (
                                    <Row
                                        style={{ width: '100%' }}
                                        gutter={[8, 0]}
                                    >
                                        <Col sm={12}>
                                            <div className="select-row">
                                                <Input
                                                    placeholder={
                                                        getRequiredFields('ctn')
                                                            ? 'Affected CTN*'
                                                            : 'CTN'
                                                    }
                                                    onChange={(e) =>
                                                        setCTN(e.target.value)
                                                    }
                                                    value={ctn}
                                                />
                                            </div>
                                        </Col>
                                        <Col sm={12}>
                                            <div className="select-row">
                                                <Input
                                                    placeholder="Enter BAN"
                                                    onChange={(e) =>
                                                        setBan(e.target.value)
                                                    }
                                                    value={ban}
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                )}
                                <Row>
                                    {caseCategoryFields[category]?.map(
                                        ({
                                            type,
                                            label,
                                            name,
                                            options,
                                            ...props
                                        }) => {
                                            switch (type) {
                                                case 'Input':
                                                    return (
                                                        <Col sm={12} lg={8}>
                                                            <Form.Item
                                                                label={
                                                                    name ===
                                                                    'imei'
                                                                        ? renderRequiredLabel(
                                                                              label,
                                                                              'imei'
                                                                          )
                                                                        : label
                                                                }
                                                            >
                                                                <Input
                                                                    autoComplete="newPassword"
                                                                    style={{
                                                                        width: 220,
                                                                        marginTop: 8,
                                                                        marginRight: 8,
                                                                    }}
                                                                    value={
                                                                        additionalProperties[
                                                                            name
                                                                        ]
                                                                    }
                                                                    name={name}
                                                                    label={
                                                                        label
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleChangeAdditionalProps(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                            name
                                                                        )
                                                                    }
                                                                    // {...props}
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                    );
                                                case 'DatePicker':
                                                    return (
                                                        <Col sm={12} lg={8}>
                                                            <Form.Item
                                                                label={label}
                                                            >
                                                                <DatePicker
                                                                    placeholder={
                                                                        label
                                                                    }
                                                                    format="YYYY-MM-DD h:mm A"
                                                                    use12Hours
                                                                    showTime
                                                                    defaultValue={
                                                                        additionalProperties[
                                                                            name
                                                                        ]
                                                                            ? moment(
                                                                                  new Date(
                                                                                      additionalProperties[
                                                                                          name
                                                                                      ]
                                                                                  )
                                                                              )
                                                                            : ''
                                                                    }
                                                                    onChange={(
                                                                        date
                                                                    ) =>
                                                                        handleChangeAdditionalProps(
                                                                            date,
                                                                            name,
                                                                            type
                                                                        )
                                                                    }
                                                                    style={{
                                                                        width: 220,
                                                                        marginTop: 8,
                                                                        marginRight: 8,
                                                                    }}
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                    );
                                                case 'Select':
                                                    const newOptions =
                                                        name === 'state'
                                                            ? stateList
                                                            : options;
                                                    return (
                                                        <Col sm={12} lg={8}>
                                                            <Form.Item
                                                                label={label}
                                                                style={{
                                                                    width: 220,
                                                                    marginTop: 8,
                                                                    marginRight: 8,
                                                                }}
                                                            >
                                                                <Select
                                                                    autoComplete="newPassword"
                                                                    value={
                                                                        additionalProperties[
                                                                            name
                                                                        ]
                                                                    }
                                                                    showSearch
                                                                    optionFilterProp="children"
                                                                    onChange={(
                                                                        value
                                                                    ) =>
                                                                        handleChangeAdditionalProps(
                                                                            value,
                                                                            name
                                                                        )
                                                                    }
                                                                    filterOption={(
                                                                        input,
                                                                        option
                                                                    ) =>
                                                                        option.children
                                                                            .toLowerCase()
                                                                            .indexOf(
                                                                                input.toLowerCase()
                                                                            ) >=
                                                                        0
                                                                    }
                                                                >
                                                                    {newOptions.map(
                                                                        (
                                                                            option
                                                                        ) => (
                                                                            <Select.Option
                                                                                value={
                                                                                    option.value
                                                                                }
                                                                                key={shortid.generate()}
                                                                            >
                                                                                {
                                                                                    option.label
                                                                                }
                                                                            </Select.Option>
                                                                        )
                                                                    )}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                    );
                                                case 'CheckBox':
                                                    return (
                                                        <Col sm={12} lg={8}>
                                                            <Form.Item
                                                                style={{
                                                                    width: 220,
                                                                    marginTop: 36,
                                                                    marginRight: 8,
                                                                }}
                                                            >
                                                                <Checkbox
                                                                    checked={
                                                                        additionalProperties[
                                                                            name
                                                                        ] ===
                                                                        'true'
                                                                            ? true
                                                                            : false
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleChangeAdditionalProps(
                                                                            e
                                                                                .target
                                                                                .checked
                                                                                ? 'true'
                                                                                : 'false',
                                                                            name
                                                                        )
                                                                    }
                                                                >
                                                                    {label}
                                                                </Checkbox>
                                                            </Form.Item>
                                                        </Col>
                                                    );
                                                default:
                                                    return <></>;
                                            }
                                        }
                                    )}
                                </Row>
                                <Row style={{ width: '100%' }}>
                                    <Col sm={24}>
                                        <Form.Item label="Subject">
                                            <Input
                                                placeholder="Case Subject"
                                                disabled
                                                value={`${category} -  ${subCategoryOne} - ${subCategoryTwo}`}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <div style={{ height: '11rem' }}>
                                    {renderRequiredLabel(
                                        'Required',
                                        'descriptionText'
                                    )}
                                    <Notes
                                        style={{
                                            height: '8rem',
                                            borderLeft: 'none',
                                            borderRight: 'none',
                                        }}
                                        theme="snow"
                                        value={descriptionHTML}
                                        onChange={handleDescriptionChange}
                                    />
                                </div>

                                {renderConfirmButton() ? (
                                    <Button
                                        style={{
                                            background: '#52c41a',
                                            border: 'none',
                                        }}
                                        type="primary"
                                        onClick={() => handleToggleEdit()}
                                    >
                                        Proceed To Confirm
                                    </Button>
                                ) : null}
                                {/* {category !== 'Select Category' &&
                                    subCategoryOne !== 'Select Category 1' &&
                                    subCategoryTwo !== 'Select Category 2' &&
                                    priority !== 'Select Priority' &&
                                    descriptionText.length > 1 &&
                                    (CTN || ctn || contactInfo) &&
                                    (
                                        <Button
                                            style={{
                                                background: '#52c41a',
                                                border: 'none',
                                            }}
                                            type="primary"
                                            onClick={() => handleToggleEdit()}
                                        >
                                            Proceed To Confirm
                                        </Button>
                                    )} */}
                            </Space>
                        )}
                    </div>
                ) : finalStep ? (
                    <Row>
                        <Col xs={24} style={{ paddingBottom: '1rem' }}>
                            <Row>
                                <Col xs={2}>
                                    <FileDoneOutlined
                                        style={{
                                            fontSize: '35px',
                                            height: '50px',
                                            width: '50px',
                                            color: '#52C41A',
                                        }}
                                    />
                                </Col>
                                <Col xs={21}>
                                    <Row>
                                        <Col xs={24}>
                                            A new case has successfully created.
                                        </Col>
                                        <Col xs={24}>
                                            <Paragraph
                                                style={{
                                                    display: 'flex',
                                                    marginTop: 12,
                                                }}
                                                copyable={{ text: caseId }}
                                            >
                                                <div>Case ID : {caseId}</div>
                                            </Paragraph>
                                        </Col>
                                        <Col xs={24}>
                                            <Paragraph
                                                style={{
                                                    display: 'flex',
                                                }}
                                                copyable={{
                                                    text: externalCaseId,
                                                }}
                                            >
                                                <div>
                                                    External Case ID :{' '}
                                                    {externalCaseId}
                                                </div>
                                            </Paragraph>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                        <Col xs={24}>
                            <Row>
                                <Space size="middle">
                                    <Button
                                        style={{
                                            backgroundColor: '#fff',
                                            color: '#7CB305',
                                            border: '1px solid #52C41A',
                                        }}
                                        type="primary"
                                        onClick={() => resetModal(true)}
                                    >
                                        Close
                                    </Button>
                                </Space>
                            </Row>
                        </Col>
                    </Row>
                ) : (
                    <div className="d-flex flex-column">
                        <Space direction="vertical" size="large">
                            <div className="d-flex flex-row justify-content-between case-text">
                                <div>
                                    <Row className="case-heading">CSR ID</Row>
                                    <Row className="case-heading-detail">
                                        {attId}
                                    </Row>
                                </div>

                                <div>
                                    <Row className="case-heading">
                                        Case Creation date & time
                                    </Row>
                                    <Row className="case-heading-detail">
                                        {currentDateTime}
                                    </Row>
                                </div>

                                <div>
                                    <Row className="case-heading">Priority</Row>
                                    <Row className="case-heading-detail">
                                        <Tag color="warning">{priority}</Tag>
                                    </Row>
                                </div>

                                <div>
                                    <Row className="case-heading">
                                        Case Source
                                    </Row>
                                    <Row className="case-heading-detail">
                                        {caseSource}
                                    </Row>
                                </div>

                                <div>
                                    <Row className="case-heading">CTN</Row>
                                    <Row className="case-heading-detail">
                                        {contactInfo
                                            ? contactInfo?.contactPhoneNumber
                                            : cmMode
                                            ? ctn
                                            : CTN}
                                    </Row>
                                </div>

                                {!contactInfo && (
                                    <div>
                                        <Row className="case-heading">BAN</Row>
                                        <Row className="case-heading-detail">
                                            {billingAccountNumber}
                                        </Row>
                                    </div>
                                )}
                            </div>

                            <div>
                                <Space size={10} style={{ marginTop: 16 }}>
                                    {category && (
                                        <Tag
                                            color="#F6FFED"
                                            className="stat-tab"
                                        >
                                            {category}
                                        </Tag>
                                    )}

                                    {subCategoryOne && (
                                        <Tag
                                            color="#E6F7FF"
                                            className="stat-tab"
                                        >
                                            {subCategoryOne}
                                        </Tag>
                                    )}
                                </Space>
                                <Space size={10} style={{ marginTop: 8 }}>
                                    {subCategoryTwo && (
                                        <Tag
                                            color="#E6F7FF"
                                            className="stat-tab"
                                        >
                                            {subCategoryTwo}
                                        </Tag>
                                    )}
                                </Space>
                                <hr
                                    style={{
                                        width: '100%',
                                        marginTop: 10,
                                        marginBottom: 0,
                                    }}
                                />
                            </div>
                            <Row>
                                <Col xs={3} className="confirmpage-heading">
                                    Subject:
                                </Col>
                                <Col xs={21} className="confirmpage-text">
                                    {`${category} -  ${subCategoryOne} - ${subCategoryTwo}`}
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={24} className="confirmpage-heading">
                                    Description
                                </Col>
                                <div
                                    xs={24}
                                    className="confirmpage-text"
                                    dangerouslySetInnerHTML={{
                                        __html: descriptionHTML,
                                    }}
                                />
                            </Row>
                            <div className="case-queue">
                                <Row className="case-heading">
                                    Queue (Optional)
                                </Row>
                                <Select
                                    value={assignedTeam}
                                    onChange={setAssignedTeam}
                                    style={{ width: 'auto', minWidth: 200 }}
                                    placeholder="Select to assign team"
                                >
                                    {queueOptions?.map(({ value }) => (
                                        <Select.Option
                                            value={value}
                                            key={shortid.generate()}
                                        >
                                            {value}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </div>
                            <div className="d-flex flex-row align-items-center justify-content-start action-buttons">
                                <Button
                                    style={{
                                        background: '#52c41a',
                                        border: 'none',
                                    }}
                                    type="primary"
                                    onClick={createCase}
                                    loading={isCreatingCase}
                                >
                                    Create Case
                                </Button>
                                <Button
                                    type="default"
                                    onClick={() => handleToggleEdit()}
                                >
                                    Edit
                                    <EditOutlined />
                                </Button>
                            </div>
                            {createCaseError !== '' && (
                                <div className="create-case-error">
                                    {createCaseError}
                                </div>
                            )}
                        </Space>
                    </div>
                )}

                {!finalStep && (
                    <Row className="footer">
                        <Button
                            style={{
                                background: '#D9D9D9',
                                borderRadius: '2px',
                            }}
                            type="default"
                            onClick={() => resetModal()}
                        >
                            Cancel
                        </Button>
                    </Row>
                )}
            </Form>
        </Modal>
    );
}
