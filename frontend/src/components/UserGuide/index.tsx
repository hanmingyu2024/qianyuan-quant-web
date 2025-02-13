import React from 'react'
import { Tour, TourProps } from 'antd'
import { useLocation } from 'react-router-dom'

const steps: Record<string, TourProps['steps']> = {
  '/': [
    {
      title: '欢迎使用',
      description: '这是交易平台的首页，您可以在这里查看市场概况。',
      target: () => document.querySelector('.ant-layout-content'),
    },
  ],
  '/market': [
    {
      title: '市场行情',
      description: '这里展示了所有交易对的实时价格和交易量。',
      target: () => document.querySelector('.market-table'),
    },
    {
      title: 'K线图',
      description: '您可以在这里查看详细的价格走势。',
      target: () => document.querySelector('.market-chart'),
    },
  ],
  '/trading': [
    {
      title: '交易面板',
      description: '在这里您可以进行买入和卖出操作。',
      target: () => document.querySelector('.trading-form'),
    },
    {
      title: '订单列表',
      description: '这里显示您的当前订单和历史订单。',
      target: () => document.querySelector('.order-list'),
    },
  ],
  // 添加更多页面的引导步骤...
}

const UserGuide: React.FC = () => {
  const location = useLocation()
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const hasShownGuide = localStorage.getItem(`guide-${location.pathname}`)
    if (!hasShownGuide && steps[location.pathname]) {
      setOpen(true)
      localStorage.setItem(`guide-${location.pathname}`, 'true')
    }
  }, [location.pathname])

  return (
    <Tour
      open={open}
      onClose={() => setOpen(false)}
      steps={steps[location.pathname] || []}
    />
  )
}

export default UserGuide 