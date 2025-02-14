import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { strategyService } from '../services/strategyService';

const { Option } = Select;

const StrategyManager = () => {
    const [strategies, setStrategies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchStrategies();
    }, []);

    const fetchStrategies = async () => {
        setLoading(true);
        try {
            const response = await strategyService.getStrategies();
            setStrategies(response.data);
        } catch (error) {
            message.error('获取策略列表失败');
        }
        setLoading(false);
    };

    const handleCreateStrategy = async (values) => {
        try {
            await strategyService.createStrategy(values);
            message.success('策略创建成功');
            setModalVisible(false);
            fetchStrategies();
        } catch (error) {
            message.error('策略创建失败');
        }
    };

    const handleStartStrategy = async (strategyId) => {
        try {
            await strategyService.startStrategy(strategyId);
            message.success('策略启动成功');
            fetchStrategies();
        } catch (error) {
            message.error('策略启动失败');
        }
    };

    const handleStopStrategy = async (strategyId) => {
        try {
            await strategyService.stopStrategy(strategyId);
            message.success('策略停止成功');
            fetchStrategies();
        } catch (error) {
            message.error('策略停止失败');
        }
    };

    const columns = [
        {
            title: '策略名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '交易品种',
            dataIndex: 'symbol',
            key: 'symbol',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span style={{ color: status === 'ACTIVE' ? '#52c41a' : '#f5222d' }}>
                    {status === 'ACTIVE' ? '运行中' : '已停止'}
                </span>
            ),
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <>
                    {record.status === 'ACTIVE' ? (
                        <Button
                            icon={<StopOutlined />}
                            onClick={() => handleStopStrategy(record.id)}
                            danger
                        >
                            停止
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            icon={<PlayCircleOutlined />}
                            onClick={() => handleStartStrategy(record.id)}
                        >
                            启动
                        </Button>
                    )}
                </>
            ),
        },
    ];

    return (
        <Card title="策略管理">
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
                style={{ marginBottom: 16 }}
            >
                新建策略
            </Button>

            <Table
                columns={columns}
                dataSource={strategies}
                loading={loading}
                rowKey="id"
            />

            <Modal
                title="新建策略"
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    onFinish={handleCreateStrategy}
                    layout="vertical"
                >
                    <Form.Item
                        name="name"
                        label="策略名称"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="symbol"
                        label="交易品种"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            <Option value="BTC/USDT">BTC/USDT</Option>
                            <Option value="ETH/USDT">ETH/USDT</Option>
                            <Option value="BNB/USDT">BNB/USDT</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            创建
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default StrategyManager; 