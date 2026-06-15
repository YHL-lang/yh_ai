import * as echarts from 'echarts';
import { salesData } from './data.js';

const chartDom = document.getElementById('chart');
const myChart = echarts.init(chartDom);

const option = {
  title: {
    text: `${salesData.company} — ${salesData.year}年${salesData.category}月度销售`,
    subtext: `单位：${salesData.unit}`,
  },
  tooltip: {
    trigger: 'axis',
    valueFormatter: (value) => `${value} 百万`,
  },
  grid: {
    top: '18%',
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: salesData.months,
    axisLabel: {
      rotate: 30,
    },
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '{value}',
    },
  },
  series: [
    {
      name: '销售额',
      type: 'bar',
      data: salesData.values,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#83bff6' },
          { offset: 0.5, color: '#188df0' },
          { offset: 1, color: '#188df0' },
        ]),
        borderRadius: [4, 4, 0, 0],
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#f6c383' },
            { offset: 0.5, color: '#f08818' },
            { offset: 1, color: '#f08818' },
          ]),
        },
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}',
        color: '#333',
        fontWeight: 'bold',
      },
    },
  ],
};

myChart.setOption(option);

window.addEventListener('resize', () => {
  myChart.resize();
});
