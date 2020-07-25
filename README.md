# mark
利用canvas对图片进行坐标标注

```
import MarkImage from "./MarkImage.js";

let markImage = new MarkImage({
    el: '#box',
  }, (list)=> {
      // 输出标注结果
      console.log(list)
    })
  // 添加要标注到图片
  markImage.image.src="test.jpg"
  // 是否拖动图片,标注只有在禁止拖动到时候才可以
  markImage.options.canMoveImage=false
  // 删除指定序号的标注 true放大，false缩小
  hey.setScale(true)
  // 缩放图片，
  hey.removeIndex(id)
```
