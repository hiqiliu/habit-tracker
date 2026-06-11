const FINANCE_SCHEDULE = [

  // 第1周
  { day: 1, type: "Day1 观看「复利效应」视频", label: "Day 1", desc: "" },
  { day: 2, type: "Day2 观看「A股新手入门」", label: "Day 2", desc: "" },
  { day: 3, type: "Day3 观看「基金基础知识」", label: "Day 3", desc: "" },
  { day: 4, type: "Day4 阅读《小狗钱钱》第1-3章", label: "Day 4", desc: "" },
  { day: 5, type: "Day5 阅读《小狗钱钱》第4-5章", label: "Day 5", desc: "" },
  { day: 6, type: "Day6 学习T+1/涨跌停/交易时间", label: "Day 6", desc: "" },
  { day: 7, type: "Day7 用思维导图整理本周知识", label: "Day 7", desc: "" },

  // 第2周
  { day: 8, type: "Day8 观看「K线图怎么看」", label: "Day 8", desc: "" },
  { day: 9, type: "Day9 学习成交量与量价关系", label: "Day 9", desc: "" },
  { day: 10, type: "Day10 观看「市盈率白话」", label: "Day 10", desc: "" },
  { day: 11, type: "Day11 学习PB = 股价/净资产", label: "Day 11", desc: "" },
  { day: 12, type: "Day12 阅读《聪明的投资者》第1章", label: "Day 12", desc: "" },
  { day: 13, type: "Day13 学习资产配置基础", label: "Day 13", desc: "" },

  // 第3周
  { day: 14, type: "Day15 观看「量化交易是什么」", label: "Day 14", desc: "" },
  { day: 15, type: "Day16 学习趋势跟踪/均值回归/多因子", label: "Day 15", desc: "" },
  { day: 16, type: "Day17 了解散户多/政策影响/涨跌停", label: "Day 16", desc: "" },
  { day: 17, type: "Day18 学习JoinQuant/akshare/tushare", label: "Day 17", desc: "" },
  { day: 18, type: "Day19 阅读知乎「量化交易入门指南」", label: "Day 18", desc: "" },
  { day: 19, type: "Day20 浏览JoinQuant策略广场", label: "Day 19", desc: "" },
  { day: 20, type: "Day21 理解策略代码大致结构", label: "Day 20", desc: "" },

  // 第4周
  { day: 21, type: "Day22 阅读akshare官方文档", label: "Day 21", desc: "" },
  { day: 22, type: "Day23 学习akshare获取历史数据", label: "Day 22", desc: "" },
  { day: 23, type: "Day24 学习读取/筛选/计算均值", label: "Day 23", desc: "" },
  { day: 24, type: "Day25 学习画折线图", label: "Day 24", desc: "" },
  { day: 25, type: "Day26 学习画candlestick", label: "Day 25", desc: "" },
  { day: 26, type: "Day27 学习DIF/DEA/柱状图", label: "Day 26", desc: "" },
  { day: 27, type: "Day28 整合本周代码", label: "Day 27", desc: "" },

  // 第5周
  { day: 28, type: "Day29 观看「双均线策略详解」", label: "Day 28", desc: "" },
  { day: 29, type: "Day30 学习MA5/10/20/60区别", label: "Day 29", desc: "" },
  { day: 30, type: "Day31 动量策略，学习涨了继续涨", label: "Day 30", desc: "" },
  { day: 31, type: "Day32 均值回归，学习跌多了会反弹", label: "Day 31", desc: "" },
  { day: 32, type: "Day33 阅读JoinQuant双均线源码", label: "Day 32", desc: "" },
  { day: 33, type: "Day34 学习年化收益/最大回撤/夏普", label: "Day 33", desc: "" },
  { day: 34, type: "Day35 画出双均线策略流程图 包含数据→信号→买卖→收益", label: "Day 34", desc: "" },

  // 第6周
  { day: 35, type: "Day36 观看「量化回测入门」", label: "Day 35", desc: "" },
  { day: 36, type: "Day37 学习过拟合概念", label: "Day 36", desc: "" },
  { day: 37, type: "Day38 学习每单位风险获得多少收益", label: "Day 37", desc: "" },
  { day: 38, type: "Day39 学习从最高点到最低点跌幅", label: "Day 38", desc: "" },
  { day: 39, type: "Day40 阅读《量化投资》第5章", label: "Day 39", desc: "" },
  { day: 40, type: "Day41 用Python写回测循环", label: "Day 40", desc: "" },
  { day: 41, type: "Day42 对比自己回测和JoinQuant", label: "Day 41", desc: "" },

  // 第7周
  { day: 42, type: "Day43 观看「backtrader教程」", label: "Day 42", desc: "" },
  { day: 43, type: "Day44 阅读官方文档Quickstart", label: "Day 43", desc: "" },
  { day: 44, type: "Day45 学习Cerebro/Strategy/DataFeed", label: "Day 44", desc: "" },
  { day: 45, type: "Day46 在backtrader写买卖逻辑", label: "Day 45", desc: "" },
  { day: 46, type: "Day47 测试不同均线组合", label: "Day 46", desc: "" },
  { day: 47, type: "Day48 训练集调参测试集验证", label: "Day 47", desc: "" },
  { day: 48, type: "Day49 分析回测稳健性", label: "Day 48", desc: "" },

  // 第8周
  { day: 49, type: "Day50 观看「同花顺模拟炒股教程」", label: "Day 49", desc: "" },
  { day: 50, type: "Day51 学习日志记录方法", label: "Day 50", desc: "" },
  { day: 51, type: "Day52 用双均线判断买卖持有信号", label: "Day 51", desc: "" },
  { day: 52, type: "Day53 按策略信号下单", label: "Day 52", desc: "" },
  { day: 53, type: "Day54 检查新买卖信号", label: "Day 53", desc: "" },
  { day: 54, type: "Day55 回顾一周模拟交易", label: "Day 54", desc: "" },
  { day: 55, type: "Day56 模拟交易第一周总结", label: "Day 55", desc: "" },

  // 第9周
  { day: 56, type: "Day57 观看「凯利公式投资」", label: "Day 56", desc: "" },
  { day: 57, type: "Day58 对比凯利和固定比例优缺点", label: "Day 57", desc: "" },
  { day: 58, type: "Day59 波动率仓位", label: "Day 58", desc: "" },
  { day: 59, type: "Day60 固定止损", label: "Day 59", desc: "" },
  { day: 60, type: "Day61 盈利后止损线上移", label: "Day 60", desc: "" },
  { day: 61, type: "Day62 目标收益率/移动止盈", label: "Day 61", desc: "" },
  { day: 62, type: "Day63 周复盘，对比加风控前后表现", label: "Day 62", desc: "" },

  // 第10周
  { day: 63, type: "Day64 观看「多因子模型入门」", label: "Day 63", desc: "" },
  { day: 64, type: "Day65 价值因子", label: "Day 64", desc: "" },
  { day: 65, type: "Day66 质量因子", label: "Day 65", desc: "" },
  { day: 66, type: "Day67 动量因子", label: "Day 66", desc: "" },
  { day: 67, type: "Day68 多因子打分", label: "Day 67", desc: "" },
  { day: 68, type: "Day69 多因子选股", label: "Day 68", desc: "" },
  { day: 69, type: "Day70 周复盘，对比单因子和多因子结果", label: "Day 69", desc: "" },

  // 第11周
  { day: 70, type: "Day71 代码整理", label: "Day 70", desc: "" },
  { day: 71, type: "Day72 统一用akshare获取数据", label: "Day 71", desc: "" },
  { day: 72, type: "Day73 多因子选股+双均线择时", label: "Day 72", desc: "" },
  { day: 73, type: "Day74 仓位管理+止损止盈", label: "Day 73", desc: "" },
  { day: 74, type: "Day75 完整回测", label: "Day 74", desc: "" },
  { day: 75, type: "Day76 阅读《聪明的投资者》第8章", label: "Day 75", desc: "" },
  { day: 76, type: "Day77 周复盘，撰写《个人投资计划书》", label: "Day 76", desc: "" },

  // 第12周
  { day: 77, type: "Day78 了解佣金/服务/量化接口", label: "Day 77", desc: "" },
  { day: 78, type: "Day79 学习QMT/Ptrade基本使用", label: "Day 78", desc: "" },
  { day: 79, type: "Day80 学习滑点/延迟/心理差异", label: "Day 79", desc: "" },
  { day: 80, type: "Day81 对照实盘检查清单", label: "Day 80", desc: "" },
  { day: 81, type: "Day82 回顾总结", label: "Day 81", desc: "" },

];
