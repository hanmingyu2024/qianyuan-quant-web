import { test, expect } from '@playwright/test'

test.describe('AnimationPath', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/market')
  })

  test('should create and edit path', async ({ page }) => {
    // 等待编辑器加载
    await page.waitForSelector('[data-testid="path-editor"]')

    // 添加点
    await page.click('[data-testid="path-editor"]', { position: { x: 100, y: 100 } })
    await page.click('[data-testid="path-editor"]', { position: { x: 200, y: 200 } })

    // 验证点是否被添加
    const points = await page.$$('[data-testid="path-point"]')
    expect(points).toHaveLength(2)

    // 编辑点
    await page.dragAndDrop(
      '[data-testid="path-point"]:first-child',
      { x: 150, y: 150 }
    )

    // 验证路径是否更新
    const path = await page.$eval('[data-testid="path"]', el => el.getAttribute('d'))
    expect(path).toContain('150,150')
  })

  test('should handle undo/redo operations', async ({ page }) => {
    await page.waitForSelector('[data-testid="path-editor"]')
    
    // 添加点
    await page.click('[data-testid="path-editor"]', { position: { x: 100, y: 100 } })
    
    // 撤销
    await page.click('[data-testid="undo-button"]')
    const pointsAfterUndo = await page.$$('[data-testid="path-point"]')
    expect(pointsAfterUndo).toHaveLength(0)
    
    // 重做
    await page.click('[data-testid="redo-button"]')
    const pointsAfterRedo = await page.$$('[data-testid="path-point"]')
    expect(pointsAfterRedo).toHaveLength(1)
  })

  test('should handle path import/export', async ({ page }) => {
    await page.waitForSelector('[data-testid="path-editor"]')
    
    // 导出路径
    await page.click('[data-testid="export-button"]')
    const download = await page.waitForEvent('download')
    expect(download.suggestedFilename()).toBe('animation-path.json')
    
    // 导入路径
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.click('[data-testid="import-button"]')
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles([download.suggestedFilename()])
    
    // 验证导入是否成功
    const successMessage = await page.waitForSelector('.ant-message-success')
    expect(await successMessage.textContent()).toContain('导入成功')
  })
})