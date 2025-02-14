import { PathPoint } from '../types'
import { easingFunctions } from './animation'

// 生成 CSS Keyframes
export function generateCSSKeyframes(points: PathPoint[], name: string = 'path-animation'): string {
  const keyframes: string[] = []
  const totalTime = points[points.length - 1].time

  points.forEach((point, index) => {
    const progress = (point.time / totalTime * 100).toFixed(2)
    keyframes.push(`
  ${progress}% {
    transform: translate(${point.x}px, ${point.y}px);
    animation-timing-function: ${point.easing};
  }`)
  })

  return `@keyframes ${name} {${keyframes.join('')}
}`
}

// 生成 SVG Path
export function generateSVGPath(points: PathPoint[]): string {
  if (points.length === 0) return ''
  
  const commands: string[] = [`M ${points[0].x} ${points[0].y}`]
  
  for (let i = 1; i < points.length; i++) {
    commands.push(`L ${points[i].x} ${points[i].y}`)
  }
  
  return commands.join(' ')
}

// 生成 JavaScript 动画代码
export function generateJSAnimation(points: PathPoint[]): string {
  const easings = new Set(points.map(p => p.easing))
  const easingFuncs = Array.from(easings).map(name => 
    `const ${name} = ${easingFunctions[name].toString()};`
  )

  const pointsArray = points.map(p => 
    `  { x: ${p.x}, y: ${p.y}, time: ${p.time}, easing: '${p.easing}' }`
  )

  return `// 动画路径点
const points = [
${pointsArray.join(',\n')}
];

// 缓动函数
${easingFuncs.join('\n')}

// 动画函数
function animate(element, duration = ${points[points.length - 1].time}) {
  let startTime = null;
  
  function update(currentTime) {
    if (!startTime) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    if (progress < 1) {
      // 找到当前时间所在的点段
      let currentIndex = 0;
      for (let i = 0; i < points.length - 1; i++) {
        if (elapsed >= points[i].time && elapsed <= points[i + 1].time) {
          currentIndex = i;
          break;
        }
      }
      
      const p1 = points[currentIndex];
      const p2 = points[currentIndex + 1];
      const segmentProgress = (elapsed - p1.time) / (p2.time - p1.time);
      const easing = window[p1.easing];
      const easedProgress = easing(segmentProgress);
      
      const x = p1.x + (p2.x - p1.x) * easedProgress;
      const y = p1.y + (p2.y - p1.y) * easedProgress;
      
      element.style.transform = \`translate(\${x}px, \${y}px)\`;
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}`
}

// 生成 React 组件代码
export function generateReactComponent(points: PathPoint[]): string {
  return `import React, { useEffect, useRef } from 'react';

export const PathAnimation = () => {
  const elementRef = useRef(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    ${generateJSAnimation(points).replace('function animate', 'function animateElement')}
    
    animateElement(element);
  }, []);
  
  return (
    <div 
      ref={elementRef}
      style={{
        position: 'absolute',
        width: '20px',
        height: '20px',
        background: '#1890ff',
        borderRadius: '50%',
      }}
    />
  );
};`
}

// 导出为 JSON 格式
export function exportToJSON(points: PathPoint[]): string {
  return JSON.stringify({
    version: '1.0.0',
    points,
    metadata: {
      totalTime: points[points.length - 1].time,
      totalLength: points.reduce((acc, p, i) => {
        if (i === 0) return 0
        const prev = points[i - 1]
        return acc + Math.sqrt(Math.pow(p.x - prev.x, 2) + Math.pow(p.y - prev.y, 2))
      }, 0),
      pointCount: points.length,
    }
  }, null, 2)
} 