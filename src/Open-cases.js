import React, { useState, useEffect, useRef } from 'react';
import { Modal, Table, Alert, Spin, Button } from 'antd';
import { MinusOutlined } from '@ant-design/icons';
import Notes from '@ivoyant/component-notes';
import { cache } from '@ivoyant/component-cache';
import { MessageBus } from '@ivoyant/component-message-bus';

//CSS
import './styles.css';

const OpenCasesModal = React.memo((props) => {
    const { properties, setOpenCases, datasources } = props;
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
        setSwitchToCreateCase,
    } = properties;
    const selectedRow = cache.get('opencaseinfo');
    const [descriptionHTML, setDescriptionHTML] = useState(
        cache.get('opencaseinfo')?.descriptionHTML || ''
    );
    const [descriptionText, setDescriptionText] = useState(
        cache.get('opencaseinfo')?.descriptionText || ''
    );
    const [selectedRowData, setSelectedRowData] = useState(
        selectedRow?.selectedRowData || undefined
    );
    const [selectedRowKeys, setSelectedRowKeys] = useState(
        selectedRow?.selectedRowKeys || []
    );
    const [udateLoading, setUpdateLoading] = useState(false);

    const contactInfo = cache.get('contactInfo');

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
    const tableData =
        opencasesResponse &&
        opencasesResponse?.map((item, i) => {
            const { caseId, caseHistory } = item;
            const caseCategory =
                caseHistory &&
                caseHistory?.map((ch) => {
                    let data = {
                        category: ch?.category,
                        subCategory1: ch?.subCategory1,
                        subCategory2: ch?.subCategory2,
                        updatedBy: ch?.updatedBy,
                        state: ch?.state,
                        status: ch?.status,
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
                key: caseId,
            };
        });

    const handleDescriptionChange = (content, delta, source, editor) => {
        setDescriptionHTML(content);
        setDescriptionText(editor.getText());
    };

    //TABLE SPECIFIC

    const columns = [
        {
            title: 'CASE ID',
            dataIndex: 'caseId',
        },
        {
            title: 'CATEGORY',
            dataIndex: 'caseCategory',
        },
        {
            title: 'SUB-CATEGORY 1',
            dataIndex: 'subCategory1',
        },
        {
            title: 'SUB-CATEGORY 2',
            dataIndex: 'subCategory2',
        },
    ];

    const onSelectChange = (selectedRowKeys, selectedRows) => {
        setSelectedRowKeys(selectedRowKeys);
        setSelectedRowData(selectedRows);
        setDescriptionHTML('');
        setDescriptionText('');
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    //UPDATE API CALL RESPONSE
    const handleUpdateSelectedCaseResponse = (successStates, errorStates) => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        const status = eventData.value;
        const isSuccess = successStates.includes(status);
        const isFailure = errorStates.includes(status);
        if (isSuccess || isFailure) {
            if (isSuccess) {
                resetData();
                setOpenCases(false);
                cache.put('opencaseinfo', '');
            }
            if (isFailure) {
                if (eventData?.event?.data?.response?.data?.causedBy) {
                    setOpenErrMessage(
                        eventData?.event?.data?.response?.data?.causedBy[0]
                            ?.message
                    );
                } else {
                    setOpenErrMessage(
                        eventData?.event?.data?.response?.data?.message
                    );
                }
            }
            setUpdateLoading(false);
            MessageBus.unsubscribe(subscriptionId);
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
            errorStates,
        } = updateOpenCaseWorkflow;
        const registrationId = workflow.concat('.').concat(agentId);
        MessageBus.subscribe(
            registrationId,
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            handleUpdateSelectedCaseResponse(successStates, errorStates)
        );
        MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
            header: {
                registrationId: registrationId,
                workflow: workflow,
                eventType: 'INIT',
            },
        });
        MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
            header: {
                registrationId: registrationId,
                workflow: workflow,
                eventType: 'SUBMIT',
            },
            body: {
                datasource: datasources[datasource],
                request: {
                    body: {
                        summary: descriptionHTML,
                        caseId: selectedRowData[0]?.caseId,
                        updatedBy: selectedRowData[0]?.updatedBy,
                        status: selectedRowData[0]?.status,
                        state: selectedRowData[0]?.state,
                    },
                },
                responseMapping,
            },
        });
    };

    // CUSTOM FOOTER
    const updateCaseModalFooter = () => {
        let footer = [];
        let newCaseButton = (
            <Button
                type="default"
                onClick={handleSwitchToCreateCase}
                className="primary-outlined-btn"
            >
                CREATE NEW CASE
            </Button>
        );
        let closeButton = (
            <Button type="default" onClick={handleClose}>
                CLOSE
            </Button>
        );
        let updateButton = (
            <Button
                type={
                    selectedRowKeys
                        ? descriptionText && descriptionText.length > 1
                            ? 'primary'
                            : 'ghost'
                        : 'ghost'
                }
                disabled={handleUpdateBtnDisable()}
                onClick={updateSelectedCase}
                loading={udateLoading}
            >
                UPDATE CASE
            </Button>
        );

        footer.push(newCaseButton);
        footer.push(updateButton);
        footer.push(closeButton);
        return footer;
    };

    // USEEFFECTS

    /**
     * Cacheing
     */

    useEffect(() => {
        if (selectedRowKeys && descriptionHTML) {
            cache.put('opencaseinfo', {
                selectedRowKeys,
                descriptionHTML,
                descriptionText,
                selectedRowData,
            });
        }
    }, [descriptionHTML, selectedRowKeys]);

    return (
        <>
            <Modal
                title="Update Case"
                open={visible}
                onOk={handleOk}
                onCancel={handleCancel}
                className="open-cases-modal"
                closeIcon={<MinusOutlined />}
                footer={null}
                width={965}
                style={{ top: '20px' }}
            >
                {!cmMode && !contactInfo && !CTN ? (
                    <div className="create-case-error">
                        Please authenticate or create contact. To use the create
                        case
                    </div>
                ) : (
                    <>
                        <article>
                            <p>
                                A case already exists for this customer. Would
                                you like to add a note to the existing case or
                                create a new case? Select the case you want to
                                update.
                            </p>
                            <Spin spinning={caseSearchLoading} tip="Loading...">
                                <Table
                                    rowSelection={{
                                        type: 'radio',
                                        ...rowSelection,
                                    }}
                                    columns={columns}
                                    dataSource={tableData}
                                    pagination={false}
                                />
                            </Spin>
                            {selectedRowKeys && selectedRowKeys.length > 0 && (
                                <div className="open-case-modal__notes-wrapper">
                                    <Notes
                                        theme="snow"
                                        value={descriptionHTML}
                                        onChange={handleDescriptionChange}
                                    />
                                </div>
                            )}
                            {openErrMessage && (
                                <div>
                                    <Alert
                                        message={openErrMessage}
                                        type="error"
                                        showIcon
                                    />
                                </div>
                            )}
                            <div className="open-cases-modal-footer-btn-group">
                                {updateCaseModalFooter()}
                            </div>
                        </article>
                    </>
                )}
            </Modal>
        </>
    );
});

export default OpenCasesModal;
