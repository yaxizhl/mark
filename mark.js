// eslint-disable-next-line no-unused-vars

export default class MarkImage {
    constructor(options, onChange) {
        this.options = {
            el: '',
            canMoveImage: false,
            list: [
                // [1900, 800, 2500, 2000],
            ]
        }
        this.origin = { // 背景图原点
            x: 0,
            y: 0
        }
        this.image = new Image()
        this.hitPoint = { // 背景图中心移动距离
            T: 0,
            L: 0,
            R: 0,
            B: 0
        }
        this.ctrl = {
            status: 0,
            r: 5,
            fill: '#fff',
            stroke: '#95fc3b'
        }
        this.activeRect = {
            status: 0, // 0,没有创建 1,正在创建 2,已完成
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
            stroke: '#95fc3b',
            fill: ''
        }
        this.confirmRect = {
            w: 40,
            h: 20,
            stroke: '#95fc3b',
            fill: '#fff',
            text: '确定'
        }
        this.onChange = onChange || (() => {})
        this.scaleStep = 0
        this.pressType = 0 // 0没有按压;1控制点1;2控制点2;3框选区;4背景图;5拖动框选区;6确定;
        Object.assign(this.options, options)
        this.canvas = document.createElement('canvas')
        this.el = document.querySelector(this.options.el)
        this.ctx = this.canvas.getContext('2d')
        this.el.appendChild(this.canvas)
        this.canvas.width = this.el.clientWidth
        this.canvas.height = this.el.clientHeight
        this.ORIGIN_IMAGE_WIDHT = 0
        this.ORIGIN_IMAGE_HEIGHT = 0
        this.setEvent()
        this.image.src = '/me.jpg'
    }
    get imageScale() {
        return this.image.width / this.ORIGIN_IMAGE_WIDHT
    }
    setEvent() {
        this.image.addEventListener('load', () => {
            this.ORIGIN_IMAGE_WIDHT = this.image.width
            this.ORIGIN_IMAGE_HEIGHT = this.image.height
            this.fitRoom()
            this.paintImage()
            this.paintRectList()
        })
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.options.canMoveImage) {
                // console.log('拖拽背景图片')
                this.pressType = 4
                this.el.style.cursor = 'move'
                this.hitPoint = {
                    T: e.offsetY - this.origin.y,
                    L: e.offsetX - this.origin.x
                }
                return
            }
            if (this.activeRect.status === 1 & this.isHitCtrl1(e)) {
                this.pressType = 1
                this.hitPoint = {
                    T: e.offsetX - this.activeRect.x1 + this.ctrl.r,
                    L: e.offsetY - this.activeRect.y1 + this.ctrl.r,
                }
                // console.log('控制点1')
                return
            }
            if (this.activeRect.status === 1 & this.isHitCtrl2(e)) {
                this.pressType = 2
                this.hitPoint = {
                    T: e.offsetX - this.activeRect.x2 + this.ctrl.r,
                    L: e.offsetY - this.activeRect.y2 + this.ctrl.r,
                }
                // console.log('控制点2')
                return
            }
            if (this.activeRect.status === 1 && this.isHitOk(e)) {
                // console.log('点击了确定')
                const {
                    x1,
                    y1,
                    x2,
                    y2
                } = this.activeRect
                const {
                    x,
                    y
                } = this.origin

                const a1 = x1 < x2 ? x1 : x2
                const a2 = x1 > x2 ? x1 : x2
                const b1 = y1 < y2 ? y1 : y2
                const b2 = y1 > y2 ? y1 : y2

                this.options.list.push([
                    parseInt((a1 - x) / this.imageScale),
                    parseInt((b1 - y) / this.imageScale),
                    parseInt((a2 - x) / this.imageScale),
                    parseInt((b2 - y) / this.imageScale),
                ])
                this.onChange(this.options.list)
                this.activeRect.status = 0
                this.ctrl.status = 0
                this.clear()
                this.paintImage()
                this.paintRectList()
                return
            }
            if (this.activeRect.status === 1 && this.isHitActiveRect(e)) {
                // console.log('开始拖动活动矩形')
                this.pressType = 5
                this.hitPoint = {
                    L: e.offsetX - this.activeRect.x1,
                    T: e.offsetY - this.activeRect.y1,
                    R: this.activeRect.x2 - e.offsetX,
                    B: this.activeRect.y2 - e.offsetY
                }
                return
            }
            if (this.isHitImage(e)) {
                // console.log('开始标注')
                this.pressType = 3
                this.activeRect.status = 1
                this.el.style.cursor = 'crosshair'
                this.activeRect.x1 = e.offsetX
                this.activeRect.y1 = e.offsetY
                return
            }

        })
        this.canvas.addEventListener('mousemove', (e) => {
            if (e.buttons !== 1) return
            // 处理边界问题
            const MAX_X = this.origin.x + this.image.width
            const MIN_X = this.origin.x
            const MAX_Y = this.origin.y + this.image.height
            const MIN_Y = this.origin.y
            switch (this.pressType) {
                case 1:
                    // 控制点1
                    this.activeRect.x1 = e.offsetX - this.hitPoint.L
                    this.activeRect.y1 = e.offsetY - this.hitPoint.T
                    this.clear()
                    this.paintImage()
                    this.paintRectList()
                    this.paintActiveRect()
                    this.paintCtrl()
                    break;
                case 2:
                    // 控制点2
                    this.activeRect.x2 = e.offsetX - this.hitPoint.L
                    this.activeRect.y2 = e.offsetY - this.hitPoint.T
                    this.clear()
                    this.paintImage()
                    this.paintRectList()
                    this.paintActiveRect()
                    this.paintCtrl()
                    break;
                case 3:
                    // 创建标记
                    if (e.offsetX < MIN_X) {
                        this.activeRect.x2 = MIN_X
                    } else if (e.offsetX > MAX_X) {
                        this.activeRect.x2 = MAX_X
                    } else {
                        this.activeRect.x2 = e.offsetX
                    }
                    if (e.offsetY < MIN_Y) {
                        this.activeRect.y2 = MIN_Y
                    } else if (e.offsetY > MAX_Y) {
                        this.activeRect.y2 = MAX_Y
                    } else {
                        this.activeRect.y2 = e.offsetY
                    }
                    this.clear()
                    this.paintImage()
                    this.paintRectList()
                    this.paintActiveRect()
                    break;
                case 4:
                    // 移动背景图
                    this.origin.x = e.offsetX - this.hitPoint.L
                    this.origin.y = e.offsetY - this.hitPoint.T
                    this.clear()
                    this.paintImage()
                    this.paintRectList()
                    break;
                case 5:
                    // 框选区整体移动
                    this.activeRect.x1 = e.offsetX - this.hitPoint.L
                    this.activeRect.y1 = e.offsetY - this.hitPoint.T
                    this.activeRect.x2 = e.offsetX + this.hitPoint.R
                    this.activeRect.y2 = e.offsetY + this.hitPoint.B
                    this.clear()
                    this.paintImage()
                    this.paintRectList()
                    this.paintActiveRect()
                    this.paintCtrl()
                    break;
                default:
                    break;
            }
        })
        this.canvas.addEventListener('mouseup', () => {
            switch (this.pressType) {
                case 1:
                    this.paintConfirmRect()
                    this.paintCtrl()
                    break;
                case 2:
                    this.paintConfirmRect()
                    this.paintCtrl()
                    break;
                case 3:
                    this.clear()
                    this.paintImage()
                    this.paintRectList()
                    this.paintActiveRect()
                    this.paintConfirmRect()
                    this.paintCtrl()
                    break;
                case 5:
                    this.paintConfirmRect()
                    this.paintCtrl()
                    break;
                default:
                    break;
            }
            this.pressType = 0
            this.el.style.cursor = null
        })
    }
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
    drawAll() {}
    paintActiveRect() {
        if (this.confirmRect.status === 0) return
        const {
            x1,
            y1,
            x2,
            y2,
            stroke
        } = this.activeRect
        this.ctx.strokeStyle = stroke
        this.ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
    }
    paintCtrl() {
        if (this.confirmRect.status === 0) return
        const {
            x1,
            y1,
            x2,
            y2
        } = this.activeRect
        const {
            r,
            fill,
            stroke
        } = this.ctrl
        const {
            ctx
        } = this
        if (x1 === x2 || y1 === y2) return
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.beginPath();
        ctx.arc(x1, y1, r, 0, Math.PI * 2, true)
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x1, y1, r, 0, Math.PI * 2, false)
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x2, y2, r, 0, Math.PI * 2, true)
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x2, y2, r, 0, Math.PI * 2, false)
        ctx.stroke();
        this.ctrl.status = 1
    }
    paintConfirmRect() {
        if (this.confirmRect.status === 0) return
        const {
            x2,
            y2,
            stroke
        } = this.activeRect
        const {
            w,
            h
        } = this.confirmRect
        const {
            ctx
        } = this
        ctx.fillStyle = '#fff'
        ctx.fillRect(x2, y2, w, h)
        ctx.save()
        ctx.translate(x2, y2)
        ctx.strokeStyle = stroke
        ctx.strokeRect(0, 0, w, h)
        ctx.fillStyle = '#000'
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        ctx.fillText(
            this.confirmRect.text,
            w / 2,
            h / 2
        )
        ctx.restore()

    }
    paintRectList() {
        const {
            ctx,
            imageScale,
            origin
        } = this
        const rect = new Rect({
            ctx,
            origin
        })
        for (let i = 0; i < this.options.list.length; i++) {
            const item = this.options.list[i];
            rect.options.index = i
            rect.options.scale = imageScale
            rect.options.coor = item
            rect.draw()
        }
    }
    setScale(type) {
        this.clear()
        type ? this.scaleStep++ : this.scaleStep--
        const abs = Math.abs(this.scaleStep)
        this.image.width = this.ORIGIN_IMAGE_WIDHT * Math.pow(this.scaleStep >= 0 ? 1.1 : 0.9, abs)
        this.image.height = this.ORIGIN_IMAGE_HEIGHT * Math.pow(this.scaleStep >= 0 ? 1.1 : 0.9, abs)
        this.alginCenter()
        this.paintImage()
        this.paintRectList()
        if (this.activeRect.status === 1) {
            this.paintActiveRect()
            this.paintConfirmRect()
        }
    }
    alginCenter() {
        this.origin = {
            x: (this.canvas.width - this.image.width) / 2,
            y: (this.canvas.height - this.image.height) / 2
        }
    }
    fitRoom() {
        if (this.image.width > this.el.clientWidth || this.image.height > this.el.clientHeight) {
            this.setScale(false)
            this.fitRoom()
        } else {
            this.alginCenter()
        }
    }
    paintImage() {
        this.ctx.drawImage(this.image, this.origin.x, this.origin.y, this.image.width, this.image.height)
    }
    isHitImage(e) {
        // 点击背景图
        return this.onArea([e.offsetX, e.offsetY], [
            this.origin.x,
            this.origin.y,
            this.origin.x + this.image.width,
            this.origin.y + this.image.height
        ])
    }
    isHitActiveRect(e) {
        return this.onArea([e.offsetX, e.offsetY], [
            this.activeRect.x1,
            this.activeRect.y1,
            this.activeRect.x2,
            this.activeRect.y2,
        ])
    }
    isHitCtrl1(e) {
        // 点击控制点1
        return this.onArea([e.offsetX, e.offsetY], [
            this.activeRect.x1 - this.ctrl.r,
            this.activeRect.y1 - this.ctrl.r,
            this.activeRect.x1 + this.ctrl.r,
            this.activeRect.y1 + this.ctrl.r,
        ])

    }
    isHitCtrl2(e) {
        // 点击控制点2
        return this.onArea([e.offsetX, e.offsetY], [
            this.activeRect.x2 - this.ctrl.r,
            this.activeRect.y2 - this.ctrl.r,
            this.activeRect.x2 + this.ctrl.r,
            this.activeRect.y2 + this.ctrl.r,
        ])
    }
    isHitOk(e) {
        // 点击确定
        return this.onArea([e.offsetX, e.offsetY], [
            this.activeRect.x2,
            this.activeRect.y2,
            this.activeRect.x2 + this.confirmRect.w,
            this.activeRect.y2 + this.confirmRect.h,
        ])

    }
    removeIndex(index) {
        this.options.list.splice(index, 1)
        this.clear()
        this.paintImage()
        this.paintRectList()
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

class Rect {
    constructor(options) {
        this.options = {
            ctx: '',
            index: 0,
            scale: 1,
            origin: {
                x: 0,
                y: 0
            },
            coor: [0, 0, 0, 0]
        }
        Object.assign(this.options, options)
    }
    draw() {
        const {
            ctx,
            index,
            origin,
            scale,
            coor
        } = this.options

        ctx.save()
        ctx.translate(origin.x, origin.y);
        ctx.fillStyle = "rgba(0,0,0,0.2)"
        ctx.fillRect(coor[0] * scale, coor[1] * scale, (coor[2] - coor[0]) * scale, (coor[3] - coor[1]) * scale);
        ctx.strokeStyle = "steelblue"
        ctx.strokeRect(coor[0] * scale, coor[1] * scale, (coor[2] - coor[0]) * scale, (coor[3] - coor[1]) * scale);
        ctx.save()
        ctx.translate(coor[0] * scale, coor[1] * scale);
        ctx.fillStyle = "#fff"
        ctx.fillRect(0, 0, 30, 15)
        ctx.strokeStyle = "#f00"
        ctx.strokeRect(0, 0, 30, 15)
        ctx.fillStyle = '#f00'
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        ctx.fillText(index, 15, 8)
        ctx.restore();
        ctx.restore();
    }
}
