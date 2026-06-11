const ENGLISH_SCHEDULE = [

  // 第一周 B级 + 700L
  { day: 1, type: "Day1 EP #B01  Newsela #1 泛读", label: "Day 1", desc: "" },
  { day: 2, type: "Day2 EP #B01 检测 Newsela #1 精读", label: "Day 2", desc: "" },
  { day: 3, type: "Day3 EP #B02  Newsela #2 泛读", label: "Day 3", desc: "" },
  { day: 4, type: "Day4 EP #B02 检测 Newsela #2 精读", label: "Day 4", desc: "" },
  { day: 5, type: "Day5 EP #B03 Newsela #3 泛读", label: "Day 5", desc: "" },
  { day: 6, type: "Day6 EP #B03 检测 Newsela #3 精读", label: "Day 6", desc: "" },
  { day: 7, type: "Day7 EP笔记复习 《老友记》S01E01 3遍", label: "Day 7", desc: "" },

  // 第二周 C级 + 750L
  { day: 8, type: "Day8 EP #C01 Newsela #4 泛读", label: "Day 8", desc: "" },
  { day: 9, type: "Day9 EP #C01 检测 Newsela #4 精读", label: "Day 9", desc: "" },
  { day: 10, type: "Day10 EP #C02 Newsela #5 泛读", label: "Day 10", desc: "" },
  { day: 11, type: "Day11 EP #C02 检测 Newsela #5 精读", label: "Day 11", desc: "" },
  { day: 12, type: "Day12 EP #C03 Newsela #6 泛读", label: "Day 12", desc: "" },
  { day: 13, type: "Day13 EP #C03 检测 Newsela #6 精读", label: "Day 13", desc: "" },
  { day: 14, type: "Day14 EP笔记复习 《老友记》E02 3遍", label: "Day 14", desc: "" },

  // 第三周 C级 + 800L
  { day: 15, type: "Day15 EP #C04 Newsela #7 泛读", label: "Day 15", desc: "" },
  { day: 16, type: "Day16 EP #C04 检测 Newsela #7 精读", label: "Day 16", desc: "" },
  { day: 17, type: "Day17 EP #C05 Newsela #8 泛读", label: "Day 17", desc: "" },
  { day: 18, type: "Day18 EP #C05 检测 Newsela #8 精读", label: "Day 18", desc: "" },
  { day: 19, type: "Day19 EP #C06 Newsela #9 泛读", label: "Day 19", desc: "" },
  { day: 20, type: "Day20 EP #C06 检测 Newsela #9 精读", label: "Day 20", desc: "" },
  { day: 21, type: "Day21 EP笔记复习 《老友记》E03 3遍", label: "Day 21", desc: "" },

  // 第四周 C级 + 800L
  { day: 22, type: "Day22 EP #C07 Newsela #10 泛读", label: "Day 22", desc: "" },
  { day: 23, type: "Day23 EP #C07 检测 Newsela #10 精读", label: "Day 23", desc: "" },
  { day: 24, type: "Day24 EP #C08 Newsela #11 泛读", label: "Day 24", desc: "" },
  { day: 25, type: "Day25 EP #C08 检测 Newsela #11 精读", label: "Day 25", desc: "" },
  { day: 26, type: "Day26 EP #C09 Newsela #12 泛读", label: "Day 26", desc: "" },
  { day: 27, type: "Day27 EP #C09 检测 Newsela #12 精读", label: "Day 27", desc: "" },
  { day: 28, type: "Day28 EP笔记复习 《老友记》E04 3遍", label: "Day 28", desc: "" },

  // 第五周 1.1 倍速 C级 + 850L
  { day: 29, type: "Day29 EP #C10 Newsela #13 泛读", label: "Day 29", desc: "" },
  { day: 30, type: "Day30 EP #C10 检测 Newsela #13 精读", label: "Day 30", desc: "" },
  { day: 31, type: "Day31 EP #C11 Newsela #14 泛读", label: "Day 31", desc: "" },
  { day: 32, type: "Day32 EP #C11 检测 Newsela #14 精读", label: "Day 32", desc: "" },
  { day: 33, type: "Day33 EP #C12 Newsela #15 泛读", label: "Day 33", desc: "" },
  { day: 34, type: "Day34 EP #C12 检测 Newsela #15 精读", label: "Day 34", desc: "" },
  { day: 35, type: "Day35 EP笔记复习 《老友记》E05 3遍", label: "Day 35", desc: "" },

  // 第六周 加入《经济学人》Espresso
  { day: 36, type: "Day36 EP #C13 Breaking News English #1 泛读", label: "Day 36", desc: "" },
  { day: 37, type: "Day37 EP #C13 检测 《经济学人》Espresso 2条短新闻 精读", label: "Day 37", desc: "" },
  { day: 38, type: "Day38 EP #C14 《经济学人》Espresso 3条短新闻 泛读", label: "Day 38", desc: "" },
  { day: 39, type: "Day39 EP #C14 检测 《经济学人》Espresso 3条短新闻 泛读", label: "Day 39", desc: "" },
  { day: 40, type: "Day40 EP #C15 《经济学人》Espresso 2条 精读", label: "Day 40", desc: "" },
  { day: 41, type: "Day41 EP #C15 检测", label: "Day 41", desc: "" },
  { day: 42, type: "Day42 EP笔记复习 《老友记》E06 3遍", label: "Day 42", desc: "" },

  // 第七周 尝试D级
  { day: 43, type: "Day43 EP #D01 《经济学人》Espresso 3条 泛读", label: "Day 43", desc: "" },
  { day: 44, type: "Day44 EP #D01 检测 《经济学人》Espresso 2条 精读", label: "Day 44", desc: "" },
  { day: 45, type: "Day45 EP #C16 Breaking News English 1篇 泛读", label: "Day 45", desc: "" },
  { day: 46, type: "Day46 EP #C16 检测 Breaking News English 1篇 精读", label: "Day 46", desc: "" },
  { day: 47, type: "Day47 EP #D02 Breaking News English 1篇 泛读", label: "Day 47", desc: "" },
  { day: 48, type: "Day48 EP #D02 检测 Breaking News English 1篇 精读", label: "Day 48", desc: "" },
  { day: 49, type: "Day49 EP笔记复习 《老友记》E07 3遍", label: "Day 49", desc: "" },

  // 第八周
  { day: 50, type: "Day50 EP #D02 《经济学人》Espresso 3条 泛读", label: "Day 50", desc: "" },
  { day: 51, type: "Day51 EP #D02 检测 《经济学人》Espresso 2条 精读", label: "Day 51", desc: "" },
  { day: 52, type: "Day52 EP #D03 Breaking News English 1篇 泛读", label: "Day 52", desc: "" },
  { day: 53, type: "Day53 EP #D03 检测 Breaking News English 1篇 精读", label: "Day 53", desc: "" },
  { day: 54, type: "Day54 EP #C17 1.2倍速 Breaking News English 1篇 泛读", label: "Day 54", desc: "" },
  { day: 55, type: "Day55 EP #C17 1.2倍速 检测 Breaking News English 1篇 精读", label: "Day 55", desc: "" },
  { day: 56, type: "Day56 EP笔记复习 《老友记》E08 3遍", label: "Day 56", desc: "" },

  // 第九周
  { day: 57, type: "Day57 EP #D04 《经济学人》Espresso 3条 泛读", label: "Day 57", desc: "" },
  { day: 58, type: "Day58 EP #D04 检测 《经济学人》Espresso 2条 精读", label: "Day 58", desc: "" },
  { day: 59, type: "Day59 EP #D05 《经济学人》完整文章1篇（Business版块） 泛读", label: "Day 59", desc: "" },
  { day: 60, type: "Day60 EP #D05 检测 《经济学人》完整文章1篇（Business版块） 精读", label: "Day 60", desc: "" },
  { day: 61, type: "Day61 EP #C18 1.2倍速 《经济学人》完整文章1篇（Leaders版块）泛读", label: "Day 61", desc: "" },
  { day: 62, type: "Day62 EP #C18 1.2倍速 检测 《经济学人》完整文章1篇（Leaders版块）精读", label: "Day 62", desc: "" },
  { day: 63, type: "Day63 EP笔记复习 《老友记》E09 3遍", label: "Day 63", desc: "" },

  // 第十周
  { day: 64, type: "Day64 EP #D06 《经济学人》Espresso 3条 泛读", label: "Day 64", desc: "" },
  { day: 65, type: "Day65 EP #D06 检测 《经济学人》Espresso 2条 精读", label: "Day 65", desc: "" },
  { day: 66, type: "Day66 EP #C19 1.2倍速  《经济学人》完整文章1篇 泛读", label: "Day 66", desc: "" },
  { day: 67, type: "Day67 EP #C19 1.2倍速 检测  《经济学人》完整文章1篇 精读", label: "Day 67", desc: "" },
  { day: 68, type: "Day68 EP #C20 1.2倍速 《经济学人》Espresso 3条 泛读", label: "Day 68", desc: "" },
  { day: 69, type: "Day69 EP #C20 1.2倍速 检测 《经济学人》Espresso 2条 精读", label: "Day 69", desc: "" },
  { day: 70, type: "Day70 EP笔记复习 《老友记》E10 3遍", label: "Day 70", desc: "" },

];
