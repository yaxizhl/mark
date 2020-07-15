let show = document.querySelector('pre')
class Heylight {
  constructor(props) {
    this.el = document.querySelector(props.el)
    this.bigBtn = document.querySelector(props.bigBtn)
    this.smallBtn = document.querySelector(props.smallBtn)
    this.inputFile = document.querySelector(props.inputFile)
    this.pressType = 0 // 0没有按压;1控制点1;2控制点2;3框选区;4确定;
    this.list = []
    this.onchange = props.onchange
    this.num = 0 // 计数器

    this.tag = {
      W: 20,
      H: 10,
      fill: '#fff',
      color: '#f00'
    }
    this.mark = {
      T: 0, // 上边距
      R: 0, // 右边距
      B: 0, // 下边距
      L: 0 // 左边距
    }
    this.dragRect = {
      status: 0, // 0,没有 1,正在创建 2,已完成
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      stroke: '#95fc3b',
      fill: ''
    }
    this.confirmRect = {
      width: 30,
      height: 20,
      fill: '#fff',
      color: '#000',
      text: '确定'
    }
    this.WIDTH = 0
    this.HEIGHT = 0
    this.setLayOut()
    this.setEvent()
  }
  get getScale() {
    return this.canvas.width / this.WIDTH
  }
  setLayOut() {
    this.wraper = document.createElement('div')
    this.wraper.style.float = 'left'
    this.wraper.style.position = 'relative'
    this.wraper.style.fontSize = 0
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.wraper.appendChild(this.canvas)
    this.el.appendChild(this.wraper)
    this.image = new Image()
  }
  drewCtrl() {
    // 设置控制点
    this.ctx.fillStyle = "white";
    this.ctx.beginPath();
    this.ctx.arc(this.dragRect.startX, this.dragRect.startY, 5, 0, Math.PI * 2, true)
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(this.dragRect.endX, this.dragRect.endY, 5, 0, Math.PI * 2, true)
    this.ctx.fill();
  }
  setEvent() {
    // 设置事件
    this.canvas.addEventListener('mousedown', (e) => {
      switch (this.dragRect.status) {
        case 0:
          // 框选开始
          this.dragRect.startX = e.offsetX
          this.dragRect.startY = e.offsetY
          this.dragRect.status = 1
          break;
        case 1:
          // 正在框选

          break;
        case 2:
          // 框选完成
          if (this.isHitCtrl1(e)) {
            this.pressType = 1
            this.mark.L = e.offsetX - this.dragRect.startX
            this.mark.T = e.offsetY - this.dragRect.startY
            return
          }
          if (this.isHitCtrl2(e)) {
            this.pressType = 2
            this.mark.R = this.dragRect.endX - e.offsetX
            this.mark.B = this.dragRect.endY - e.offsetY
            return
          }
          if (this.isHitRect(e)) {
            this.pressType = 3
            this.mark.L = e.offsetX - this.dragRect.startX
            this.mark.T = e.offsetY - this.dragRect.startY
            this.mark.R = this.dragRect.endX - e.offsetX
            this.mark.B = this.dragRect.endY - e.offsetY
            return
          }
          break;

        default:
          break;
      }
    })
    this.canvas.addEventListener('mousemove', (e) => {
      switch (this.dragRect.status) {
        case 0:
          // 框选开始

          break;
        case 1:
          // 正在框选
          this.dragRect.endX = e.offsetX
          this.dragRect.endY = e.offsetY
          this.clearCanvas()
          this.drewBackground()
          this.drewRect()
          this.drewList()
          break;
        case 2:
          // 框选完成
          if (e.buttons === 1) {
            if (this.pressType === 1) {
              this.dragRect.startX = e.offsetX - this.mark.L
              this.dragRect.startY = e.offsetY - this.mark.T
            }
            if (this.pressType === 2) {
              this.dragRect.endX = e.offsetX + this.mark.R
              this.dragRect.endY = e.offsetY + this.mark.B
            }
            if (this.pressType === 3) {
              this.dragRect.startX = e.offsetX - this.mark.L
              this.dragRect.startY = e.offsetY - this.mark.T
              this.dragRect.endX = e.offsetX + this.mark.R
              this.dragRect.endY = e.offsetY + this.mark.B
            }
            this.clearCanvas()
            this.drewBackground()
            this.drewRect()
            this.drewCtrl()
            this.drewConfirm()
            this.drewList()
          }
          break;

        default:
          break;
      }
    })
    this.canvas.addEventListener('mouseup', (e) => {
      switch (this.dragRect.status) {
        case 0:
          // 框选开始

          break;
        case 1:
          // 正在框选
          // 使框选结束
          this.dragRect.endX = e.offsetX
          this.dragRect.endY = e.offsetY
          this.drewCtrl()
          this.drewConfirm()
          this.drewList()
          this.dragRect.status = 2
          break;
        case 2:
          // 框选完成
          // 点击确认
          if (this.isHitOk(e)) {
            this.pressType === 4
            let {
              startX,
              startY,
              endX,
              endY
            } = this.dragRect

            this.list.push({
              x1: startX / this.getScale,
              y1: startY / this.getScale,
              x2: endX / this.getScale,
              y2: endY / this.getScale,
              id: this.num++
            })
            this.onchange(this.list)
            // 还原拖动状态
            this.dragRect.status = 0
            this.clearCanvas()
            this.drewBackground()
            this.drewList()
          }
          break;

        default:
          break;
      }
      this.pressType = 0
      this.clickX = 0
      this.clickY = 0
    })
    this.image.addEventListener('load', () => {
      this.WIDTH = this.canvas.width = this.image.width
      this.HEIGHT = this.canvas.height = this.image.height
      this.ctx.drawImage(this.image, 0, 0)
    })
    this.inputFile.addEventListener('change', e => {
      let file = e.target.files[0]
      this.image.src = URL.createObjectURL(file)
    })
    this.bigBtn.addEventListener('click', this.setScale.bind(this, 'bigger'))
    this.smallBtn.addEventListener('click', this.setScale.bind(this, 'smaller'))
  }
  isHitRect(e) {
    // 点击框选区域
    return e.buttons === 1 && this.onArea([e.offsetX, e.offsetY], [
      this.dragRect.startX,
      this.dragRect.startY,
      this.dragRect.endX,
      this.dragRect.endY,
    ])

  }
  isHitOk(e) {
    // 点击确定
    return this.onArea([e.offsetX, e.offsetY], [
      this.dragRect.endX + 5,
      this.dragRect.endY + 5,
      this.dragRect.endX + this.confirmRect.width + 5,
      this.dragRect.endY + this.confirmRect.height + 5,
    ])

  }
  isHitCtrl1(e) {
    // 点击控制点1
    return e.buttons === 1 && this.onArea([e.offsetX, e.offsetY], [
      this.dragRect.startX - 5,
      this.dragRect.startY - 5,
      this.dragRect.startX + 5,
      this.dragRect.startY + 5,
    ])

  }
  isHitCtrl2(e) {
    // 点击控制点2
    return e.buttons === 1 && this.onArea([e.offsetX, e.offsetY], [
      this.dragRect.endX - 5,
      this.dragRect.endY - 5,
      this.dragRect.endX + 5,
      this.dragRect.endY + 5,
    ])
  }
  setScale(type) {
    // 设置缩放
    let scale = type === 'bigger' ? 1.1 : 0.9
    this.canvas.width *= scale
    this.canvas.height *= scale
    this.clearCanvas()
    this.drewBackground()
    this.drewList()
    if (this.dragRect.status === 2) {
      this.drewRect()
      this.drewCtrl()
      this.drewConfirm()
    }
  }
  drewBackground() {
    this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height)
  }
  drewConfirm() {
    this.ctx.fillStyle = this.confirmRect.fill
    this.ctx.fillRect(
      this.dragRect.endX + 5,
      this.dragRect.endY,
      this.confirmRect.width,
      this.confirmRect.height
    );
    this.ctx.fillStyle = '#000'
    this.ctx.textBaseline = 'middle'
    this.ctx.textAlign = 'center'
    this.ctx.fillText(
      this.confirmRect.text,
      this.dragRect.endX + this.confirmRect.width / 2 + 5,
      this.dragRect.endY + this.confirmRect.height / 2
    )
  }
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  drewRect() {
    // 绘制框选图
    this.ctx.strokeStyle = this.dragRect.stroke
    this.ctx.strokeRect(
      this.dragRect.startX,
      this.dragRect.startY,
      this.dragRect.endX - this.dragRect.startX,
      this.dragRect.endY - this.dragRect.startY
    );

  }
  drewList() {
    this.ctx.strokeStyle = '#fff'
    for (let m = 0; m < this.list.length; m++) {
      const item = this.list[m];
      this.ctx.strokeRect(
        item.x1 * this.getScale,
        item.y1 * this.getScale,
        (item.x2 - item.x1) * this.getScale,
        (item.y2 - item.y1) * this.getScale
      );
      // tagname
      this.ctx.fillStyle = this.tag.fill
      // 修正角标位置
      if (item.x1 < item.x2 && item.y1 < item.y2) {
        // 右下
        this.ctx.fillRect(
          item.x1 * this.getScale,
          item.y1 * this.getScale,
          this.tag.W,
          this.tag.H)
        this.ctx.fillStyle = this.tag.color
        this.ctx.textBaseline = 'middle'
        this.ctx.textAlign = 'center'
        this.ctx.fillText(
          item.id,
          item.x1 * this.getScale + this.tag.W / 2,
          item.y1 * this.getScale + this.tag.H / 2)
      } else if (item.x1 < item.x2 && item.y1 > item.y2) {
        // 右上
        this.ctx.fillRect(
          item.x1 * this.getScale,
          item.y2 * this.getScale,
          this.tag.W,
          this.tag.H
        )
        this.ctx.fillStyle = this.tag.color
        this.ctx.textBaseline = 'middle'
        this.ctx.textAlign = 'center'
        this.ctx.fillText(
          item.id,
          item.x1 * this.getScale + this.tag.W / 2,
          item.y2 * this.getScale + this.tag.H / 2
        )
      } else if (item.x1 > item.x2 && item.y1 > item.y2) {
        // 左上
        this.ctx.fillRect(
          item.x2 * this.getScale,
          item.y2 * this.getScale,
          this.tag.W,
          this.tag.H
        )
        this.ctx.fillStyle = this.tag.color
        this.ctx.textBaseline = 'middle'
        this.ctx.textAlign = 'center'
        this.ctx.fillText(
          item.id,
          item.x2 * this.getScale + this.tag.W / 2,
          item.y2 * this.getScale + this.tag.H / 2
        )
      } else {
        // 左下
        this.ctx.fillRect(
          item.x2 * this.getScale,
          item.y1 * this.getScale,
          this.tag.W,
          this.tag.H
        )
        this.ctx.fillStyle = this.tag.color
        this.ctx.textBaseline = 'middle'
        this.ctx.textAlign = 'center'
        this.ctx.fillText(
          item.id,
          item.x2 * this.getScale + this.tag.W / 2,
          item.y1 * this.getScale + this.tag.H / 2
        )
      }

    }
  }
  removeItem(id) {
    for (let n = 0; n < this.list.length; n++) {
      const item = this.list[n];
      if (item.id == id) {
        this.list.splice(n, 1)
        break
      }
    }
    this.clearCanvas()
    this.drewBackground()
    this.drewList()
    this.onchange(this.list)
  }
  onArea(target, area) {
    let x1, x2, y1, y2
    if (area[0] < area[2]) {
      x1 = area[0]
      x2 = area[2]
    } else {
      x1 = area[2]
      x2 = area[0]
    }
    if (area[1] < area[3]) {
      y1 = area[1]
      y2 = area[3]
    } else {
      y1 = area[3]
      y2 = area[1]
    }
    return (target[0] > x1 && target[0] < x2 && target[1] > y1 && target[1] < y2)
  }
}
