let clickObj = {
    container: null,
    triggerCls1: '',
    triggerCls2: '',
    start: false,
    triggerType: '',
    curlineId: 0,
    triggerDom1: null,
    triggerDom2: null,
    x: 0,
    y: 0,
    angle: 0,
    len: 0,
    lineArr: [],
    createId: (prevStr) => {
      return `line_${prevStr}_${new Date().getTime()}_${parseInt(Math.random())}`
    },
    // 两点的角度
    calculateAngle(x1, y1, x2, y2) {
      var angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      if(angle < 0) return angle < 0 ? 360 + angle : angle
      return angle;
    },
    // 两点的距离
    distance(x1, y1, x2, y2) {
      var dx = x2 - x1;
      var dy = y2 - y1;
      return Math.sqrt(dx * dx + dy * dy);
    },

    // 添加线条容器
    addLineBox() {
      $('.lineCon').prepend('<div class="line-box" style="position: relative;"></div>')
    },

    // 事件触发
    addTriggerFunc() {
      const clickObj = this
      $('.lineCon').on('click', '.'+this.triggerCls1, function(e) {
        clickObj.startFunc(e)
      })
      $('.lineCon').on('click', '.'+this.triggerCls2, function(e) {
        clickObj.startFunc(e)
      })
      $('.lineCon').on('click', '.line', function(e) {
        $(this).remove()
        let lineId = $(this).attr('line-id')
          , delIndex = clickObj.lineArr.findIndex(_l => _l.id == lineId)
        clickObj.lineArr.splice(delIndex, 1)
        console.log(lineId, clickObj.lineArr)
      })
    },

    /**
     * 点击连线的点触发的事件，
     * 第一次点击设置start=true,设置点击的触发器类型为1，第二次点击触发器类型2才可以连线，第二次还是点击触发器类型1，则覆盖第一次点击的触发节点（反之亦然）
    */
    startFunc(e) {
      if (this.start == false) {
        if($(e.currentTarget).hasClass(this.triggerCls1)) {
          this.triggerType = 1
        } else {
          this.triggerType = 2
        }
        this.triggerDom1 = e.currentTarget
        this.start = !this.start
      } else {
        if(this.triggerType == 1 && $(e.currentTarget).hasClass(this.triggerCls2) || this.triggerType == 2 && $(e.currentTarget).hasClass(this.triggerCls1)) {
          this.triggerDom2 = e.currentTarget
          this.curlineId = this.createId((this.lineArr.length || 0))
          this.lineArr.push({
            dom1: this.triggerDom1,
            dom2: this.triggerDom2,
            id: this.curlineId,
          })
          this.drawLineFunc()
          this.start = !this.start
        } else {
          if($(e.currentTarget).hasClass(this.triggerCls1)) {
            this.triggerType = 1
          } else {
            this.triggerType = 2
          }
          this.triggerDom1 = e.currentTarget
        }
      }
    },

    /**
     * 连接两点（triggerDom1， triggerDom2）之间的线条，
     * 线的长度需要去掉第一个点的宽高
     * 线的位置需要去掉第一个点的宽，一半高和线条盒子的相对于总容器的偏移量
    */
    drawLineFunc() {
      let containerRect = this.container.getBoundingClientRect()
        , lineBoxRect = document.querySelector('.line-box').getBoundingClientRect()
        , offsetX = lineBoxRect.x - containerRect.x
        , offsetY = lineBoxRect.y - containerRect.y
        , dom1Rect = this.triggerDom1.getBoundingClientRect()
        , dom2Rect = this.triggerDom2.getBoundingClientRect()
        , x1 = dom1Rect.x + dom1Rect.width - offsetX
        , x2 = dom2Rect.x - offsetX
        , y1 = dom1Rect.y + dom1Rect.height/2 - offsetY
        , y2 = dom2Rect.y + dom2Rect.height/2 - offsetY
      if (dom1Rect.x > dom2Rect.x) {
        x1 = dom2Rect.x + dom2Rect.width - offsetX
        x2 = dom1Rect.x - offsetX
        y1 = dom2Rect.y + dom2Rect.height/2 - offsetY
        y2 = dom1Rect.y + dom1Rect.height/2 - offsetY
      }
      this.x = x1
      this.y = y1
      this.angle = this.calculateAngle(x1, y1, x2, y2)
      this.len = this.distance(x1, y1, x2, y2)
  
      
      let lineStr = `<div class="line"
        title="点击删除线"
        line-id="${this.curlineId}"
        style="position: absolute;
          left: ${this.x - containerRect.x}px;
          top: ${this.y - containerRect.y}px;
          width: ${this.len}px;
          height: 1px;
          background: #000;
          transform-origin: left top;
          transform: rotate(${this.angle}deg)"></div>`
      $('.line-box').append(lineStr)
    },
    // 设置lineArr
    setLineArr(param) {
      this.lineArr = param?.map((_l, index) => {
        return {..._l, id: this.createId(index)}
      })
      this.initLineArrDraw()
    },
    // 删除所有线条并清空dom节点
    delAllLineArr() {
      this.lineArr = []
      this.removeLineFunc()
    },
    // 清空已经绘制的线条dom节点
    removeLineFunc() {
      $('.line-box .line').remove()
    },
    // 根据设置的lineArr,初始化已连接的线条
    initLineArrDraw() {
      this.removeLineFunc()
      this.lineArr.forEach(_l => {
        this.triggerDom1 = _l.dom1
        this.triggerDom2 = _l.dom2
        this.curlineId = _l.id
        this.drawLineFunc()
      })
    },
    // 初始化连线
    init(params) {
      if (!params.lineConDom || params.lineConDom.length == 0) {
        // tkMessage.warn('请传入连线的容器')
        return
      } else if (params.lineTriggers?.length < 2) {
        // tkMessage.warn('请传入连线的触发元素类')
        return
      }
      this.container = params.lineConDom
      this.triggerCls1 = params.lineTriggers[0]
      this.triggerCls2 = params.lineTriggers[1]
      this.addLineBox()
      this.addTriggerFunc()
    }
}
export default clickObj