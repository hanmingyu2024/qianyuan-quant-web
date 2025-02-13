import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import AnimationPath from '../index'
import { PathPoint } from '../types'

describe('AnimationPath', () => {
  const mockOnChange = jest.fn()
  const mockOnPreview = jest.fn()
  
  const defaultProps = {
    onChange: mockOnChange,
    onPreview: mockOnPreview,
    selectedDrawing: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders without crashing', () => {
    render(<AnimationPath {...defaultProps} />)
    expect(screen.getByText('路径编辑')).toBeInTheDocument()
  })

  test('handles point addition', () => {
    render(<AnimationPath {...defaultProps} />)
    const canvas = screen.getByRole('presentation')
    fireEvent.click(canvas, { clientX: 100, clientY: 100 })
    expect(mockOnChange).toHaveBeenCalled()
  })

  test('handles point deletion', () => {
    const points: PathPoint[] = [{
      id: '1',
      x: 100,
      y: 100,
      time: 0,
      easing: 'linear'
    }]
    
    render(<AnimationPath {...defaultProps} points={points} />)
    const deleteButton = screen.getByRole('button', { name: /删除/i })
    fireEvent.click(deleteButton)
    expect(mockOnChange).toHaveBeenCalledWith([])
  })
})