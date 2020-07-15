# mark
利用canvas对图片进行坐标标注

使用方法参考index.html
```css
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    #box {
      width: 800px;
      height: 600px;
      overflow: auto;
      background-color: rgba(0, 0, 0, 0.2);
    }
```
```html
  <div id="box"></div>
  <button class="big">放大</button>
  <button class="small">缩小</button>
  <input type="file">
```
```
let hey = new Heylight({
    el: '#box',
    bigBtn: '.big', // 
    smallBtn: '.small',
    inputFile: '[type=file]',
    onchange(list) {
      console.log(list)
    }
  })
  // 删除指定序号的标注
  // hey.removeItem(id)
```
