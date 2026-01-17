export default function() {

    /**
     * @description: 判断dom元素是否包含子节点
     * @param {*} dom
     * @return {*} 有返回子节点，无返回空
     */
    const getChild = (dom) => {
        return dom.children ? dom.children : "";
    };

    /**
     * @description: 递归获取元素下的子节点，包括孙子节点
     * @param {*} Obj 查询dom对象
     * @param {*} Arr 返回数组
     * @return {*} dom元素对象数组
     */
    const getAllChild = (Obj, Arr) => {
        let allchild = getChild(Obj);
        let Len = allchild.length;
        if (Len > 0) {
            for (let i = 0; i < Len; i++) {
                getAllChild(allchild[i], Arr);
                Arr.push(allchild[i]);
            }
        }
        return Arr;
    };

    /**
     * @description: 查询html字符串是否判定为空值
     * @param {*} htmlStr
     * @return {*} false 不为空  true空
     */
    const isEmptyHtml = (htmlStr) => {
        const divDom = document.createElement("div");
        divDom.innerHTML = htmlStr;

        const divDomText = divDom.innerText.replace(/\s*/g, "");
        // 存在文字输入返回false 不为空
        if (divDomText.length !== 0) return false;

        // 获取所有孙子元素去找到是否有img和table
        let childrenDomList = [];
        const allChild = getAllChild(divDom, childrenDomList);

        const childrenDomListStr = allChild.map((_c) => {
            return _c.tagName;
        });

        // 子元素包含table、img则不为空
        const isExist = childrenDomListStr.find((_c) => ["TABLE", "IMG"].includes(_c));

        return !isExist;
    };
    return { isEmptyHtml };
}