import { v4 } from "uuid";
const questionTypes = [
  {
    language: "zh-CN",
    id: "1862375451565178880",
    questionType: 1,
    bankId: "1862375451510652928",
    name: "单选题；单项选择题",
  },
  {
    language: "zh-CN",
    id: "1862375451565178881",
    questionType: 2,
    bankId: "1862375451510652928",
    name: "多选题；多项选择题",
  },
  {
    language: "zh-CN",
    id: "1862375451565178882",
    questionType: 7,
    bankId: "1862375451510652928",
    name: "不定项选择题",
  },
  {
    language: "zh-CN",
    id: "1862375451565178883",
    questionType: 3,
    bankId: "1862375451510652928",
    name: "填空题",
  },
  {
    language: "zh-CN",
    id: "1862375451565178884",
    questionType: 4,
    bankId: "1862375451510652928",
    name: "判断题",
  },
  {
    language: "zh-CN",
    id: "1862375451565178885",
    questionType: 5,
    bankId: "1862375451510652928",
    name: "简答题",
  },
  {
    language: "zh-CN",
    id: "1862375451565178886",
    questionType: 6,
    bankId: "1862375451510652928",
    name: "组合题",
  },
];

export function formatQuestionList(aiType,content) {
  console.log("🚀 ~ formatQuestionList ~ content:", JSON.stringify(content));
  let list = [];
  let markdown = "";
  //生成试题
  if(aiType === "sendQuestion"){
      // 使用正则表达式提取内容
      let itemContent = content.replace(/<details(.*?)<\/details>/s,'');
      //去掉think
      itemContent = itemContent.replace(/<think(.*?)<\/think>/s,'')
      //去掉markdown
      itemContent = itemContent.replace(/```markdown(.*?)```/s,'')
       //去掉json
       const jsonMatch = itemContent.match(/```json(.*?)```/s);
       if(jsonMatch){
        itemContent = jsonMatch[1]
       }

      if (itemContent) {
        const aiRes = JSON.parse(itemContent);
        const isArray = Array.isArray(aiRes);
        if (isArray) {
          // 多个返回数组
          list = aiRes?.map((ele) => {
            const convertTypeItem =
              questionTypes?.find((_c) => _c.name?.includes(ele.type)) ?? {};

            const options =
              ele.options?.map((item) => {
                const key = Object.keys(item)[0]; // 获取对象的键（A, B, C, D）
                return { label: key, value: item[key] }; // 创建新的对象
              }) ?? [];
            return {
              ...ele,
              id: `__q_${v4()}`,
              questionType: convertTypeItem?.questionType ?? "",
              questionTypeName: convertTypeItem?.name || ele?.name,
              options,
            };
          });
        } else if (aiRes?.type) {
          // 单个返回对象
          const convertTypeItem =
            questionTypes?.find((_c) => _c.name.includes(aiRes.type)) ?? {};

          const options =
            aiRes.options?.map((item) => {
              const key = Object.keys(item)[0]; // 获取对象的键（A, B, C, D）
              return { label: key, value: item[key] }; // 创建新的对象
            }) ?? [];

          list = [
            {
              ...aiRes,
              id: `__q_${v4()}`,
              questionType: convertTypeItem?.questionType ?? "",
              questionTypeName: convertTypeItem.name || aiRes.name,
              options,
            },
          ];
        }
      } else {
        console.log("没有找到match符合条件的内容");
      }

      console.log("🚀 ~ 试题列表 ~ list:", list);
  }

  //显示markdown
  let matchMarkdown = content.replace(/<details(.*?)<\/details>/s,'');
  //去掉think
  matchMarkdown = matchMarkdown.replace(/<think(.*?)<\/think>/s,'')
  matchMarkdown = matchMarkdown.match(/```markdown(.*?)```/s);
  if (matchMarkdown) {
    // Find the start and end indexes of the markdown section
    const startIndex = content.indexOf("```markdown") + "```markdown".length;
    const endIndex = content.lastIndexOf("```");

    // Extract the markdown content
    const markdownContent = content.substring(startIndex, endIndex);
    markdown = markdownContent;
  } else {
    console.log("没有找到matchMarkdown符合条件的内容");
  }

  // 使用正则表达式删除以<details>开头和details>结尾的内容
  let contentMatch = content.match(/<think([\s\S]*?)<\/think>/g);
  if(!contentMatch)  contentMatch = content.match(/<details([\s\S]*?)<\/details>/g);
  let othersContent = contentMatch || "";

  return {
    list,
    othersContent,
    markdown,
  };
}
