# JS高级程序设计第四版--第6章.集合引用类型

## 6.1 Object

显式地创建 Object 的实例有两种方式。

第一种使用 `new 操作符和 Object 构造函数`，如下所示：

```js
let person = new Object(); 
person.name = "Nicholas"; 
person.age = 29;
```

第二种方式是使用 `对象字面量（object literal）` 表示法。对象字面量是对象定义的简写形式，目的是为了简化包含大量属性的对象的创建。比如，下面的代码定义了与前面示例相同的 person 对象，但使用的是对象字面量表示法：

```js
let person = { 
 name: "Nicholas", 
 age: 29 
};
```

> 建议使用对象字面量表示法来创建对象

在对象字面量表示法中，属性名可以是字符串或数值。注意，数值属性会自动转换为字符串。

当然也可以用对象字面量表示法来定义一个只有默认属性和方法的对象，只要使用一对大括号，中间留空就行了：

```js
let person = {}; // 与 new Object()相同
person.name = "Nicholas"; 
person.age = 29;
```

> 在使用对象字面量表示法定义对象时，并不会实际调用 Object 构造函数。



虽然属性一般是通过点语法来存取的，这也是面向对象语言的惯例，但也可以使用中括号来存取属性。在使用中括号时，要在括号内使用属性名的字符串形式，比如：

```js
console.log(person["name"]); // "Nicholas" 
console.log(person.name); // "Nicholas"
```

从功能上讲，这两种存取属性的方式没有区别。使用中括号的主要优势就是可以通过 `变量` 访问属性，就像下面这个例子中一样：

```js
let propertyName = "name"; 
console.log(person[propertyName]); // "Nicholas"
```

另外，如果属性名中包含可能会导致语法错误的字符，或者包含关键字/保留字时，也可以使用中括号语法。比如：

```js
person["first name"] = "Nicholas";
```

> 所以常量属性最好通过 `.` 符号来取。除非访问属性时必须使用变量。



## 6.2 Array

ECMAScript 数组也是一组有序的数据，但跟其他语言不同的是，数组中每个槽位可以存储任意类型的数据。这意味着可以创建一个数组，它的第一个元素是字符串，第二个元素是数值，第三个是对象。ECMAScript 数组也是动态大小的，会随着数据添加而自动增长。



### 6.2.1 创建数组

有几种基本的方式可以创建数组。一种是使用 Array 构造函数，比如：

```js
let colors = new Array();
```

创建数组时可以给构造函数传一个值。这时候就有点问题了，因为如果这个值是数值，则会创建一个长度为指定数值的数组；而如果这个值是其他类型的，则会创建一个只包含该特定值的数组。下面看一个例子：

```js
let colors = new Array(3); // 创建一个包含 3 个元素的数组
let names = new Array("Greg"); // 创建一个只包含一个元素，即字符串"Greg"的数组
```

在使用 Array 构造函数时，也可以省略 new 操作符。结果是一样的，比如：

```js
let colors = Array(3); // 创建一个包含 3 个元素的数组
let names = Array("Greg"); // 创建一个只包含一个元素，即字符串"Greg"的数组
```

> 针对这个问题，我们可以直接使用ES6中的数组扩展方法 Array.of() 替代 Array() 方法来创建数组。



第二种创建数组的方式是使用数组字面量（array literal）表示法。数组字面量是在中括号中包含以逗号分隔的元素列表，如下面的例子所示：

```js
let colors = ["red", "blue", "green"]; // 创建一个包含 3 个元素的数组
let names = []; // 创建一个空数组
let values = [1,2,]; // 创建一个包含 2 个元素的数组
```

> 与对象一样，在使用数组字面量表示法创建数组不会调用 Array 构造函数。



Array 构造函数还有两个 ES6 新增的用于创建数组的静态方法：`from()` 和 `of()`。from()用于将类数组结构转换为数组实例，而 of()用于将一组参数转换为数组实例。



Array.from()的第一个参数是一个 `类数组对象`，即任何可迭代的结构，或者有一个 length 属性和可索引元素的结构（不需要实现 Iterator 接口）。这种方式可用于很多场合：

```js
console.log(Array.from("Matt")); // ["M", "a", "t", "t"] 
// 可以使用 from()将集合和映射转换为一个新数组
const m = new Map().set(1, 2) 
 .set(3, 4); 
const s = new Set().add(1) 
 .add(2) 
 .add(3) 
 .add(4); 
console.log(Array.from(m)); // [[1, 2], [3, 4]] 
console.log(Array.from(s)); // [1, 2, 3, 4] 
// Array.from()对现有数组执行浅复制
const a1 = [1, 2, 3, 4]; 
const a2 = Array.from(a1); 
console.log(a1); // [1, 2, 3, 4] 
alert(a1 === a2); // false 
// 可以使用任何可迭代对象
const iter = { 
 *[Symbol.iterator]() { 
 yield 1; 
 yield 2; 
 yield 3; 
 yield 4; 
 } 
}; 
console.log(Array.from(iter)); // [1, 2, 3, 4]

// arguments 对象可以被轻松地转换为数组
function getArgsArray() { 
 return Array.from(arguments); 
} 
console.log(getArgsArray(1, 2, 3, 4)); // [1, 2, 3, 4] 
// from()也能转换带有必要属性的自定义对象
const arrayLikeObject = { 
 0: 1, 
 1: 2, 
 2: 3, 
 3: 4, 
 length: 4 
}; 
console.log(Array.from(arrayLikeObject)); // [1, 2, 3, 4]
```

Array.from()还接收第二个可选的映射函数参数。这个函数可以直接增强新数组的值，而无须像调用 Array.from().map()那样先创建一个中间数组。还可以接收第三个可选参数，用于指定映射函数中 this 的值。但这个重写的 this 值在箭头函数中不适用。

> 第二个参数是 map() 操作。

```js
const a1 = [1, 2, 3, 4]; 

const a2 = Array.from(a1, x => x**2); 
const a3 = Array.from(a1, function(x) {return x**this.exponent}, {exponent: 2}); 

console.log(a2); // [1, 4, 9, 16] 
console.log(a3); // [1, 4, 9, 16]
```

Array.of()可以把一组参数转换为数组。这个方法用于替代在 ES6之前常用的 Array.prototype. slice.call(arguments)，一种异常笨拙的将 arguments 对象转换为数组的写法：

```js
console.log(Array.of(1, 2, 3, 4)); // [1, 2, 3, 4] 
console.log(Array.of(undefined)); // [undefined]
```



### 6.2.2 数组空位

使用数组字面量初始化数组时，可以使用一串逗号来创建空位（hole）。ECMAScript 会将逗号之间相应索引位置的值当成空位，ES6 规范重新定义了该如何处理这些空位。ES6 新增的方法和迭代器与早期 ECMAScript 版本中存在的方法行为不同。ES6 新增方法普遍将这些空位当成存在的元素，只不过值为 undefined：

```js
const options = [1,,,,5]; 
for (const option of options) { 
 console.log(option === undefined); 
} 
// false 
// true 
// true 
// true 
// false
```



### 6.2.3 数组索引

要取得或设置数组的值，需要使用中括号并提供相应值的数字索引，如下所示：

```js
let colors = ["red", "blue", "green"]; // 定义一个字符串数组
alert(colors[0]); // 显示第一项
colors[2] = "black"; // 修改第三项
colors[3] = "brown"; // 添加第四项
```



数组 length 属性的独特之处在于，它不是只读的。通过修改 length 属性，可以从数组末尾删除或添加元素。来看下面的例子：

```js
let colors = ["red", "blue", "green"]; // 创建一个包含 3 个字符串的数组
colors.length = 2; 
alert(colors[2]); // undefined
```

将数组 colors 的 length 设置为 4，虽然数组只包含 3 个元素。位置 3 在数组中不存在，因此访问其值会返回特殊值 undefined。

```js
let colors = ["red", "blue", "green"]; // 创建一个包含 3 个字符串的数组
colors.length = 4; 
alert(colors[3]); // undefined
```

数组中最后一个元素的索引始终是 length - 1，因此下一个新增槽位的索引就是 length。



### 6.2.4 检测数组

一个经典的 ECMAScript 问题是判断一个对象是不是数组。在只有一个网页（因而只有一个全局作用域）的情况下，使用 instanceof 操作符就足矣：

```js
if (value instanceof Array){ 
 // 操作数组
}
```

使用 instanceof 的问题是假定只有一个全局执行上下文。如果网页里有多个框架，则可能涉及两个不同的全局执行上下文，因此就会有两个不同版本的 Array 构造函数。如果要把数组从一个框架传给另一个框架，则这个数组的构造函数将有别于在第二个框架内本地创建的数组。

为解决这个问题，ECMAScript 提供了 `Array.isArray()` 方法。这个方法的目的就是确定一个值是否为数组，而不用管它是在哪个全局执行上下文中创建的。来看下面的例子：

```js
if (Array.isArray(value)){ 
 // 操作数组
}
```



### 6.2.5 迭代器方法

在 ES6 中，Array 的原型上暴露了 3 个用于检索数组内容的方法：`keys()`、`values()` 和 `entries()`。keys()返回数组索引的 `迭代器`，values()返回数组元素的 `迭代器`，而 entries()返回索引/值对的 `迭代器`：

```js
const a = ["foo", "bar", "baz", "qux"]; 
// 因为这些方法都返回迭代器，所以可以将它们的内容
// 通过 Array.from()直接转换为数组实例

const aKeys = Array.from(a.keys()); 
const aValues = Array.from(a.values()); 
const aEntries = Array.from(a.entries()); 

console.log(aKeys); // [0, 1, 2, 3] 
console.log(aValues); // ["foo", "bar", "baz", "qux"] 
console.log(aEntries); // [[0, "foo"], [1, "bar"], [2, "baz"], [3, "qux"]]
```

使用 ES6 的解构可以非常容易地在循环中拆分键/值对：

```js
const a = ["foo", "bar", "baz", "qux"]; 
for (const [idx, element] of a.entries()) { 
 alert(idx); 
 alert(element); 
} 

// 0 
// foo 
// 1 
// bar 
// 2 
// baz 
// 3 
// qux
```



### 6.2.6 复制和填充方法

ES6 新增了两个方法：批量复制方法 `copyWithin()`，以及填充数组方法 `fill()`。这两个方法的函数签名类似，都需要指定既有数组实例上的一个范围，包含开始索引，不包含结束索引。`使用这个方法不会改变数组的大小`。



使用 `fill()` 方法可以向一个已有的数组中插入全部或部分相同的值。开始索引用于指定开始填充的位置，它是可选的。如果不提供结束索引，则一直填充到数组末尾。负值索引从数组末尾开始计算。也可以将负索引想象成数组长度加上它得到的一个正索引：

```js
const zeroes = [0, 0, 0, 0, 0]; 

// 用 5 填充整个数组
zeroes.fill(5); 
console.log(zeroes); // [5, 5, 5, 5, 5] 
zeroes.fill(0); // 重置

// 用 6 填充索引大于等于 3 的元素
zeroes.fill(6, 3); 
console.log(zeroes); // [0, 0, 0, 6, 6] 
zeroes.fill(0); // 重置

// 用 7 填充索引大于等于 1 且小于 3 的元素
zeroes.fill(7, 1, 3); 
console.log(zeroes); // [0, 7, 7, 0, 0]; 
zeroes.fill(0); // 重置
```



与 fill()不同，`copyWithin()` 会按照指定范围浅复制数组中的部分内容，然后将它们插入到指定索引开始的位置。开始索引和结束索引则与 fill()使用同样的计算方法：

```js
let ints, 
 reset = () => ints = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; 
reset(); 

// 从 ints 中复制索引 0 开始的内容，插入到索引 5 开始的位置
// 在源索引或目标索引到达数组边界时停止
ints.copyWithin(5); 
console.log(ints); // [0, 1, 2, 3, 4, 0, 1, 2, 3, 4] 
reset(); 

// 从 ints 中复制索引 5 开始的内容，插入到索引 0 开始的位置
ints.copyWithin(0, 5); 
console.log(ints); // [5, 6, 7, 8, 9, 5, 6, 7, 8, 9]
reset();
```



### 6.2.7 转换方法

前面提到过，所有对象都有 `toLocaleString()`、`toString()` 和 `valueOf()`方法。其中，valueOf()返回的还是数组本身。而 toString()返回由数组中每个值的等效字符串拼接而成的一个逗号分隔的字符串。也就是说，对数组的每个值都会调用其 toString()方法，以得到最终的字符串。来看下面的例子：

```js
let colors = ["red", "blue", "green"]; // 创建一个包含 3 个字符串的数组

alert(colors.toString()); // red,blue,green 
alert(colors.valueOf()); // red,blue,green 
alert(colors); // red,blue,green
```

首先是被显式调用的 toString()和 valueOf()方法，它们分别返回了数组的字符串表示，即将所有字符串组合起来，以逗号分隔。最后一行代码直接用 alert()显示数组，因为 alert()期待字符串，所以会在后台调用数组的 toString()方法，从而得到跟前面一样的结果。



继承的方法 toLocaleString()以及 toString()都返回数组值的逗号分隔的字符串。如果想使用不同的分隔符，则可以使用 `join()`方法。join()方法接收一个参数，即字符串分隔符，返回包含所有项的字符串。来看下面的例子：

> colors.join() 实际上是 toString() 方法与 join() 方法结合。

```js
let colors = ["red", "green", "blue"]; 
alert(colors.join(",")); // red,green,blue 
alert(colors.join("||")); // red||green||blue
```



### 6.2.8 栈方法

ECMAScript 给数组提供几个方法，让它看起来像是另外一种数据结构。数组对象可以像栈一样，也就是一种限制插入和删除项的数据结构。

数据项的插入（称为推入，push）和删除（称为弹出，pop）只在栈的一个地方发生，即栈顶。ECMAScript 数组提供了 `push()` 和 `pop()` 方法，以实现类似栈的行为。

`push()` 方法接收任意数量的参数，并将它们添加到数组末尾，`返回数组的最新长度`。

`pop()` 方法则用于删除数组的最后一项，同时减少数组的 length 值，`返回被删除的项`。

```js
let colors = new Array(); // 创建一个数组
let count = colors.push("red", "green"); // 推入两项
alert(count); // 2 

count = colors.push("black"); // 再推入一项
alert(count); // 3 

let item = colors.pop(); // 取得最后一项
alert(item); // black 
alert(colors.length); // 2
```



### 6.2.9 队列方法

队列在列表末尾添加数据，但从列表开头获取数据。因为有了在数据末尾添加数据的 push()方法，所以要模拟队列就差一个从数组开头取得数据的方法了。这个数组方法叫 shift()，它会删除数组的第一项并返回它，然后数组长度减 1。使用 `shift()` 和 `push()`，可以把数组当成队列来使用：

```js
let colors = new Array(); // 创建一个数组
let count = colors.push("red", "green"); // 推入两项
alert(count); // 2 

count = colors.push("black"); // 再推入一项
alert(count); // 3 

let item = colors.shift(); // 取得第一项
alert(item); // red 
alert(colors.length); // 2
```



ECMAScript 也为数组提供了 unshift()方法。顾名思义，unshift()就是执行跟 shift()相反的操作：在数组开头添加任意多个值，然后返回新的数组长度。通过使用 `unshift()` 和 `pop()`，可以在相反方向上模拟队列，即在数组开头添加新数据，在数组末尾取得数据。



### 6.2.10 排序方法

数组有两个方法可以用来对元素重新排序：`reverse()` 和 `sort()`。



顾名思义，`reverse()` 方法就是将数组元素反向排列。比如：

```js
let values = [1, 2, 3, 4, 5]; 
values.reverse(); 
alert(values); // 5,4,3,2,1
```



`sort()` 会按照升序重新排列数组元素，即最小的值在前面，最大的值在后面。为此，sort()会在每一项上调用 String()转型函数，然后比较字符串来决定顺序。即使数组的元素都是数值，也会先把数组转换为字符串再比较、排序。比如：

> reverse() 方法只是简单的将顺序置反，而sort() 方法可以接收一个比较函数来排序。

```js
let values = [0, 1, 5, 10, 15]; 
values.sort(); 
alert(values); // 0,1,10,15,5
```

一开始数组中数值的顺序是正确的，但调用 sort()会按照这些数值的字符串形式重新排序。因此，即使 5 小于 10，但字符串"10"在字符串"5"的前头，所以 10 还是会排到 5 前面。很明显，这在多数情况下都不是最合适的。为此，sort()方法可以接收一个 `比较函数` ，用于判断哪个值应该排在前面。



`比较函数` 接收两个参数，如果第一个参数应该排在第二个参数前面，就返回负值；如果两个参数相等，就返回 0；如果第一个参数应该排在第二个参数后面，就返回正值。下面是使用简单比较函数的一个例子：

```js
function compare(value1, value2) { 
 if (value1 < value2) { 
 return -1; 
 } else if (value1 > value2) { 
 return 1; 
 } else { 
 return 0; 
 } 
}
```

这个比较函数可以适用于大多数数据类型，可以把它当作参数传给 sort()方法，如下所示：

```js
let values = [0, 1, 5, 10, 15]; 
values.sort(compare); 
alert(values); // 0,1,5,10,15
```

在给 sort()方法传入比较函数后，数组中的数值在排序后保持了正确的顺序。当然，比较函数也可以产生降序效果，只要把返回值交换一下即可：

```js
function compare(value1, value2) { 
 if (value1 < value2) { 
return 1; 
 } else if (value1 > value2) { 
return -1; 
 } else { 
 return 0; 
 } 
}

let values = [0, 1, 5, 10, 15]; 
values.sort(compare); 
alert(values); // 15,10,5,1,0
```

此外，这个比较函数还可简写为一个箭头函数：

```js
let values = [0, 1, 5, 10, 15]; 
values.sort((a, b) => a < b ? 1 : a > b ? -1 : 0); 
alert(values); // 15,10,5,1,0
```

> reverse()和 sort()都返回调用它们的数组的引用。



如果数组的元素是数值，或者是其 valueOf()方法返回数值的对象（如 Date 对象），这个比较函数还可以写得更简单，因为这时可以直接用第二个值减去第一个值：

```js
function compare(value1, value2){ 
 return value2 - value1; 
}
```



### 6.2.11 操作方法

对于数组中的元素，我们有很多操作方法。

比如，`concat()` 方法**（字符串也有 concat() 方法）**可以在现有数组全部元素基础上 `创建一个新数组`。它首先会创建一个当前数组的副本，然后再把它的参数添加到副本末尾，最后返回这个新构建的数组。如果传入一个或多个数组，则 concat()会把这些数组的每一项都添加到结果数组。如果参数不是数组，则直接把它们添加到结果数组末尾。来看下面的例子：

```js
let colors = ["red", "green", "blue"]; 
let colors2 = colors.concat("yellow", ["black", "brown"]); 

console.log(colors); // ["red", "green","blue"] 
console.log(colors2); // ["red", "green", "blue", "yellow", "black", "brown"]
```



接下来，方法 `slice()` 用于创建一个包含原有数组中一个或多个元素的新数组**（字符串中也有 slice() 方法）**，这个操作不影响原始数组。

> 如果 slice()的参数有负值，那么就以数值长度加上这个负值的结果确定位置。比如，在包含 5 个元素的数组上调用 slice(-2,-1)，就相当于调用 slice(3,4)。如果结束位置小于开始位置，则返回空数组。



或许最强大的数组方法就属 `splice()` 了，使用它的方式可以有很多种。splice()的主要目的是在数组中间插入元素，但有 3 种不同的方式使用这个方法。

- 删除。需要给 splice()传 2 个参数：要删除的第一个元素的位置和要删除的元素数量。可以从数组中删除任意多个元素，比如 splice(0, 2)会删除前两个元素。

- 插入。需要给 splice()传 3 个参数：开始位置、0（要删除的元素数量）和要插入的元素，可以在数组中指定的位置插入元素。第三个参数之后还可以传第四个、第五个参数，乃至任意多个要插入的元素。比如，splice(2, 0, "red", "green")会从数组位置 2 开始插入字符串"red"和"green"。 
- 替换。splice()在删除元素的同时可以在指定位置插入新元素，同样要传入 3 个参数：开始位置、要删除元素的数量和要插入的任意多个元素。要插入的元素数量不一定跟删除的元素数量一致。比如，splice(2, 1, "red", "green")会在位置 2 删除一个元素，然后从该位置开始向数组中插入"red"和"green"。

splice()方法始终 `返回这样一个数组`，它 `包含从数组中被删除的元素`（如果没有删除元素，则返回空数组）。以下示例展示了上述 3 种使用方式。

```js
let colors = ["red", "green", "blue"]; 
let removed = colors.splice(0,1); // 删除第一项
alert(colors); // green,blue 
alert(removed); // red，只有一个元素的数组

removed = colors.splice(1, 0, "yellow", "orange"); // 在位置 1 插入两个元素
alert(colors); // green,yellow,orange,blue 
alert(removed); // 空数组

removed = colors.splice(1, 1, "red", "purple"); // 插入两个值，删除一个元素
alert(colors); // green,red,purple,orange,blue 
alert(removed); // yellow，只有一个元素的数组
```



### 6.2.12 搜索和位置方法

ECMAScript 提供两类搜索数组的方法：按严格相等搜索和按断言函数搜索。

#### 严格相等

ECMAScript 提供了 3 个严格相等的搜索方法：`indexOf()`、`lastIndexOf()`和 `includes()`。其中，前两个方法在所有版本中都可用，而第三个方法是 ECMAScript 7 新增的。这些方法都接收两个参数：要查找的元素和一个可选的起始搜索位置。indexOf()和 includes()方法从数组前头（第一项）开始向后搜索，而 lastIndexOf()从数组末尾（最后一项）开始向前搜索。

indexOf()和 lastIndexOf()都 `返回要查找的元素在数组中的位置，如果没找到则返回-1`。includes() `返回布尔值`，表示是否至少找到一个与指定元素匹配的项。在比较第一个参数跟数组每一项时，会使用全等（===）比较，也就是说两项必须严格相等。下面来看一些例子：

```js
let numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1]; 

alert(numbers.indexOf(4)); // 3 
alert(numbers.lastIndexOf(4)); // 5 
alert(numbers.includes(4)); // true 
alert(numbers.indexOf(4, 4)); // 5 
alert(numbers.lastIndexOf(4, 4)); // 3 
alert(numbers.includes(4, 7)); // false 

let person = { name: "Nicholas" }; 
let people = [{ name: "Nicholas" }]; 
let morePeople = [person]; 

alert(people.indexOf(person)); // -1 
alert(morePeople.indexOf(person)); // 0 
alert(people.includes(person)); // false 
alert(morePeople.includes(person)); // true
```



#### 断言函数

ECMAScript 也允许按照定义的断言函数搜索数组，每个索引都会调用这个函数。断言函数的返回值决定了相应索引的元素是否被认为匹配。断言函数接收 3 个参数：`元素`、`索引` 和 `数组` 本身。其中元素是数组中当前搜索的元素，索引是当前元素的索引，而数组就是正在搜索的数组。断言函数返回真值，表示是否匹配。

`find()` 和 `findIndex()` 方法使用了断言函数。这两个方法都从数组的最小索引开始。find()返回第一个匹配的元素，findIndex()返回第一个匹配元素的索引。这两个方法也都接收第二个可选的参数，用于指定断言函数内部 this 的值。

```js
const people = [ 
 { 
 name: "Matt", 
 age: 27 
 }, 
 { 
 name: "Nicholas", 
 age: 29 
 } 
]; 

alert(people.find((element, index, array) => element.age < 28)); 
// {name: "Matt", age: 27} 
alert(people.findIndex((element, index, array) => element.age < 28)); 
// 0
```

找到匹配项后，这两个方法都不再继续搜索。

```js
const evens = [2, 4, 6]; 

// 如下所示，找到匹配后，永远不会检查数组的最后一个元素
evens.find((element, index, array) => { 
 console.log(element); 
 console.log(index); 
 console.log(array); 
 return element === 4; 
}); 

// 2 
// 0 
// [2, 4, 6] 
// 4 
// 1 
// [2, 4, 6]
```



### 6.2.13 迭代方法（重要）

> 迭代方法可以替代解构来进行每一项的操作。

ECMAScript 为数组定义了 5 个迭代方法。每个方法接收两个参数：以每一项为参数运行的函数，以及可选的作为函数运行上下文的作用域对象（影响函数中 this 的值）。传给每个方法的函数接收 3个参数：`数组元素`、`元素索引` 和 `数组本身`。`因具体方法而异，这个函数的执行结果可能会也可能不会影响方法的返回值`。数组的 5 个迭代方法如下。

- every()：对数组每一项都运行传入的函数，如果对每一项函数都返回 true，则这个方法返回 true。 

- filter()：对数组每一项都运行传入的函数，函数返回 true 的项会组成数组之后返回。

- forEach()：对数组每一项都运行传入的函数，没有返回值。

- map()：对数组每一项都运行传入的函数，返回由每次函数调用的结果构成的数组。

- some()：对数组每一项都运行传入的函数，如果有一项函数返回 true，则这个方法返回 true。

`这些方法都不改变调用它们的数组。`



`every()` 和 `some()` 是最相似的，都是从数组中搜索符合某个条件的元素。对 every()来说，传入的函数必须对每一项都返回 true，它才会返回 true；否则，它就返回 false。而对 some()来说，只要有一项让传入的函数返回 true，它就会返回 true。下面是一个例子：

```js
let numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1]; 

let everyResult = numbers.every((item, index, array) => item > 2); 
alert(everyResult); // false 

let someResult = numbers.some((item, index, array) => item > 2); 
alert(someResult); // true
```



`filter()` 方法。这个方法基于给定的函数来决定某一项是否应该包含在它返回的数组中。比如，要 `返回一个所有数值都大于 2 的数组`，可以使用如下代码：

> 这个方法非常适合从数组中筛选满足给定条件的元素。

```js
let numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1]; 

let filterResult = numbers.filter((item, index, array) => item > 2); 
alert(filterResult); // 3,4,5,4,3
```



`map()` 方法也会返回一个数组。这个数组的每一项都是对原始数组中同样位置的元素运行传入函数而返回的结果。例如，可以将一个数组中的每一项都乘以 2，并 `返回包含所有结果的数组`，如下所示：

> 这个方法非常适合创建一个与原始数组元素一一对应的新数组。

```js
let numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1]; 

let mapResult = numbers.map((item, index, array) => item * 2); 
alert(mapResult); // 2, 4, 6, 8, 10, 8, 6, 4, 2
```



`forEach()` 方法。这个方法只会对每一项运行传入的函数，`没有返回值`。本质上，forEach()方法相当于使用 for 循环遍历数组。比如：

```js
let numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1]; 

numbers.forEach((item, index, array) => { 
 // 执行某些操作
});
```



### 6.2.14 归并方法

ECMAScript 为数组提供了两个归并方法：`reduce()` 和 `reduceRight()`。这两个方法都会迭代数组的所有项，并在此基础上构建一个最终返回值。reduce()方法从数组第一项开始遍历到最后一项。而 reduceRight()从最后一项开始遍历至第一项。

这两个方法都接收两个参数：对每一项都会运行的归并函数，以及可选的以之为归并起点的初始值。传给 reduce()和 reduceRight()的函数接收 4 个参数：`上一个归并值`、`当前项`、`当前项的索引` 和 `数组本身`。这个函数返回的任何值都会作为下一次调用同一个函数的第一个参数。`如果没有给这两个方法传入可选的第二个参数（作为归并起点值）`，则第一次迭代将从数组的第二项开始，因此传给归并函数的第一个参数是数组的第一项，第二个参数是数组的第二项。

使用 `reduce()` 函数执行累加数组中所有数值的操作，比如：

```js
let values = [1, 2, 3, 4, 5]; 
let sum = values.reduce((prev, cur, index, array) => prev + cur); 

alert(sum); // 15
```

第一次执行归并函数时，prev 是 1，cur 是 2。第二次执行时，prev 是 3（1 + 2），cur 是 3（数组第三项）。如此递进，直到把所有项都遍历一次，最后返回归并结果。

`reduceRight()` 方法与之类似，只是方向相反。



## 6.3 定型数组



## 6.4 Map

ECMAScript 6 以前，在 JavaScript 中实现“键/值”式存储可以使用 Object 来方便高效地完成，也就是使用对象属性作为键，再使用属性来引用值。但这种实现并非没有问题，为此 TC39 委员会专门为“键/值”存储定义了一个规范。

作为 ECMAScript 6 的新增特性，`Map 是一种新的集合类型`，为这门语言带来了真正的键/值存储机制。Map 的大多数特性都可以通过 Object 类型实现，但二者之间还是存在一些细微的差异。具体实践中使用哪一个，还是值得细细甄别。



### 6.4.1 基本 API

使用 new 关键字和 Map 构造函数可以创建一个空映射：

```js
const m = new Map();
```

如果想在创建的同时初始化实例，可以给 Map 构造函数传入一个可迭代对象，需要包含键/值对数组。可迭代对象中的每个键/值对都会按照迭代顺序插入到新映射实例中：

```js
// 使用嵌套数组初始化映射
const m1 = new Map([ 
 ["key1", "val1"], 
 ["key2", "val2"], 
 ["key3", "val3"] 
]); 
alert(m1.size); // 3 

// 使用自定义迭代器初始化映射
const m2 = new Map({ 
 [Symbol.iterator]: function*() { 
 yield ["key1", "val1"]; 
 yield ["key2", "val2"]; 
 yield ["key3", "val3"]; 
 } 
}); 
alert(m2.size); // 3 

// 映射期待的键/值对，无论是否提供
const m3 = new Map([[]]); 
alert(m3.has(undefined)); // true 
alert(m3.get(undefined)); // undefined
```

初始化之后，可以使用 `set()` 方法再添加键/值对。另外，可以使用 `get()` 和 `has()` 进行查询，可以通过 `size` 属性获取映射中的键/值对的数量，还可以使用 `delete()` 和 `clear()` 删除值。

```js
const m = new Map(); 
alert(m.has("firstName")); // false 
alert(m.get("firstName")); // undefined 
alert(m.size); // 0 

m.set("firstName", "Matt") 
 .set("lastName", "Frisbie"); 

alert(m.has("firstName")); // true 
alert(m.get("firstName")); // Matt 
alert(m.size); // 2 

m.delete("firstName"); // 只删除这一个键/值对

alert(m.has("firstName")); // false 
alert(m.has("lastName")); // true 
alert(m.size); // 1 

m.clear(); // 清除这个映射实例中的所有键/值对

alert(m.has("firstName")); // false 
alert(m.has("lastName")); // false 
alert(m.size); // 0
```



`set()方法返回映射实例`，因此可以把多个操作连缀起来，包括初始化声明：

```js
const m = new Map().set("key1", "val1"); 

m.set("key2", "val2") 
 .set("key3", "val3"); 

alert(m.size); // 3
```



与 Object 只能使用数值、字符串或符号作为键不同，`Map 可以使用任何 JavaScript 数据类型作为键`。

```js
const m = new Map();
const functionKey = function() {}; 
const symbolKey = Symbol(); 
const objectKey = new Object(); 

m.set(functionKey, "functionValue"); 
m.set(symbolKey, "symbolValue"); 
m.set(objectKey, "objectValue"); 

alert(m.get(functionKey)); // functionValue 
alert(m.get(symbolKey)); // symbolValue 
alert(m.get(objectKey)); // objectValue 

// SameValueZero 比较意味着独立实例不冲突
alert(m.get(function() {})); // undefined
```



与严格相等一样，在映射中用作键和值的对象及其他“集合”类型，在自己的内容或属性被修改时仍然保持不变：

```js
const m = new Map(); 
const objKey = {}, 
 objVal = {}, 
 arrKey = [], 
 arrVal = []; 

m.set(objKey, objVal); 
m.set(arrKey, arrVal); 

objKey.foo = "foo"; 
objVal.bar = "bar"; 
arrKey.push("foo"); 
arrVal.push("bar"); 

console.log(m.get(objKey)); // {bar: "bar"} 
console.log(m.get(arrKey)); // ["bar"]
```



### 6.4.2 顺序与迭代

与 Object 类型的一个主要差异是，Map 实例会维护键值对的插入顺序，因此可以根据插入顺序执行迭代操作。

映射实例可以提供一个迭代器（Iterator），能以插入顺序生成[key, value]形式的数组。可以通过 `entries()` 方法（或者 Symbol.iterator 属性，它引用 entries()）取得这个迭代器：

```js
const m = new Map([ 
 ["key1", "val1"], 
 ["key2", "val2"], 
 ["key3", "val3"] 
]); 

alert(m.entries === m[Symbol.iterator]); // true 

for (let pair of m.entries()) { 
 alert(pair); 
} 
// [key1,val1] 
// [key2,val2] 
// [key3,val3] 

for (let pair of m[Symbol.iterator]()) { 
 alert(pair); 
} 
// [key1,val1] 
// [key2,val2] 
// [key3,val3]
```

因为 entries()是默认迭代器，所以可以直接对映射实例使用扩展操作，把映射转换为数组：

```js
const m = new Map([ 
 ["key1", "val1"], 
 ["key2", "val2"], 
 ["key3", "val3"] 
]); 

console.log([...m]); // [[key1,val1],[key2,val2],[key3,val3]]
```



如果不使用迭代器，而是 `使用回调方式`，则可以调用映射的 forEach(callback, opt_thisArg)方法并传入回调，依次迭代每个键/值对。传入的回调接收可选的第二个参数，这个参数用于重写回调内部 `this` 的值：

```js
const m = new Map([ 
 ["key1", "val1"], 
 ["key2", "val2"], 
 ["key3", "val3"] 
]); 

m.forEach((val, key) => alert(`${key} -> ${val}`)); 
// key1 -> val1 
// key2 -> val2 
// key3 -> val3
```

keys()和 values()分别返回以插入顺序生成键和值的迭代器：

```js
const m = new Map([ 
 ["key1", "val1"], 
 ["key2", "val2"], 
 ["key3", "val3"] 
]); 

for (let key of m.keys()) { 
 alert(key); 
} 
// key1 
// key2 
// key3 

for (let key of m.values()) { 
 alert(key); 
} 
// value1 
// value2 
// value3
```

键和值在迭代器遍历时是可以修改的，但映射内部的引用则无法修改。当然，这并不妨碍修改作为键或值的对象内部的属性，因为这样并不影响它们在映射实例中的身份：

```js
 ["key1", "val1"] 
]); 

// 作为键的字符串原始值是不能修改的
for (let key of m1.keys()) { 
 key = "newKey"; 
 alert(key); // newKey 
 alert(m1.get("key1")); // val1 
} 

const keyObj = {id: 1}; 

const m = new Map([ 
 [keyObj, "val1"] 
]); 

// 修改了作为键的对象的属性，但对象在映射内部仍然引用相同的值
for (let key of m.keys()) { 
 key.id = "newKey"; 
 alert(key); // {id: "newKey"} 
 alert(m.get(keyObj)); // val1 
} 

alert(keyObj); // {id: "newKey"}
```



### 6.4.3 选择 Object 还是 Map

#### 内存占用

给定固定大小的内存，Map 大约可以比 Object 多存储 50%的键/值对。



#### 插入性能

如果代码涉及大量插入操作，Map 的性能更佳。



#### 查找速度

如果代码涉及大量查找操作，那么某些情况下可能选择 Object 更好一些。



#### 删除性能

而对大多数浏览器引擎来说，Map 的 delete()操作都比插入和查找更快。如果代码涉及大量删除操作，那么毫无疑问应该选择 Map。



## 6.5 WeakMap

ECMAScript 6 新增的“弱映射”（WeakMap）是一种新的集合类型，为这门语言带来了增强的键/值对存储机制。WeakMap 是 Map 的“兄弟”类型，其 API 也是 Map 的子集。WeakMap 中的“weak”（弱），描述的是 JavaScript 垃圾回收程序对待“弱映射”中键的方式。



## 6.6 Set

ECMAScript 6 新增的 Set 是一种新集合类型，为这门语言带来集合数据结构。Set 在很多方面都像是加强的 Map，这是因为它们的大多数 API 和行为都是共有的。



### 6.6.1 基本 API

使用 new 关键字和 Set 构造函数可以创建一个空集合：

```js
const m = new Set();
```



如果想在创建的同时初始化实例，则可以给 Set 构造函数传入一个 `可迭代对象`，其中需要包含插入到新集合实例中的元素：

```js
// 使用数组初始化集合
const s1 = new Set(["val1", "val2", "val3"]); 

alert(s1.size); // 3 ，和Map一样是通过size属性查看长度

// 使用自定义迭代器初始化集合
const s2 = new Set({ 
 [Symbol.iterator]: function*() { 
 yield "val1"; 
 yield "val2"; 
 yield "val3"; 
 } 
}); 

alert(s2.size); // 3
```

初始化之后，可以使用 `add()` 增加值，使用 `has()` 查询，通过 `size` 取得元素数量，以及使用 `delete()` 和 `clear()` 删除元素。**（可参照 Map 中方法）**

add()返回集合的实例，所以可以将多个添加操作连缀起来，包括初始化：

```js
const s = new Set().add("val1"); 

s.add("val2") 
 .add("val3"); 

alert(s.size); // 3
```

与 Map 类似，Set 可以包含任何 JavaScript 数据类型作为值。集合也使用 SameValueZero 操作（ECMAScript 内部定义，无法在语言中使用），基本上相当于使用严格对象相等的标准来检查值的匹配性。



### 6.6.2 顺序与迭代

Set 会维护值插入时的顺序，因此支持按顺序迭代。

集合实例可以提供一个迭代器（Iterator），能以插入顺序生成集合内容。可以通过 `values()` 方法及其别名方法 `keys()`（或者 Symbol.iterator 属性，它引用 values()）取得这个迭代器：

```js
const s = new Set(["val1", "val2", "val3"]); 

alert(s.values === s[Symbol.iterator]); // true 
alert(s.keys === s[Symbol.iterator]); // true 

for (let value of s.values()) { 
 alert(value); 
} 
// val1 
// val2 
// val3 

for (let value of s[Symbol.iterator]()) { 
 alert(value); 
} 
// val1 
// val2 
// val3
```

因为 values()是默认迭代器，所以可以直接对集合实例使用扩展操作，把集合转换为数组：

```js
const s = new Set(["val1", "val2", "val3"]); 

console.log([...s]); // ["val1", "val2", "val3"]
```

集合的 `entries()` 方法返回一个迭代器，可以按照插入顺序产生包含两个元素的数组，这两个元素是集合中每个值的重复出现：

```js
const s = new Set(["val1", "val2", "val3"]); 

for (let pair of s.entries()) { 
 console.log(pair); 
} 
// ["val1", "val1"] 
// ["val2", "val2"] 
// ["val3", "val3"]
```

如果不使用迭代器，而是使用回调方式，则可以调用集合的 forEach()方法并传入回调，依次迭代每个键/值对。传入的回调接收可选的第二个参数，这个参数用于重写回调内部 this 的值：

```js
const s = new Set(["val1", "val2", "val3"]); 

s.forEach((val, dupVal) => alert(`${val} -> ${dupVal}`)); 
// val1 -> val1 
// val2 -> val2 
// val3 -> val3
```

修改集合中值的属性不会影响其作为集合值的身份：

```js
const s1 = new Set(["val1"]); 

// 字符串原始值作为值不会被修改
for (let value of s1.values()) { 
 value = "newVal"; 
 alert(value); // newVal 
 alert(s1.has("val1")); // true 
} 

const valObj = {id: 1}; 
const s2 = new Set([valObj]); 

// 修改值对象的属性，但对象仍然存在于集合中
for (let value of s2.values()) { 
 value.id = "newVal"; 
 alert(value); // {id: "newVal"} 
 alert(s2.has(valObj)); // true 
} 

alert(valObj); // {id: "newVal"}
```



### 6.6.3 定义正式集合操作

从各方面来看，`Set` 跟 `Map` 都很相似，只是 API 稍有调整。唯一需要强调的就是集合的 API 对自身的简单操作。很多开发者都喜欢使用 Set 操作，但需要手动实现：或者是子类化 Set，或者是定义一个实用函数库。要把两种方式合二为一，可以在子类上实现静态方法，然后在实例方法中使用这些静态方法。在实现这些操作时，需要考虑几个地方。

- 某些 Set 操作是有关联性的，因此最好让实现的方法能支持处理任意多个集合实例。

- Set 保留插入顺序，所有方法返回的集合必须保证顺序。

- 尽可能高效地使用内存。扩展操作符的语法很简洁，但尽可能避免集合和数组间的相互转换能够节省对象初始化成本。

- 不要修改已有的集合实例。union(a, b)或 a.union(b)应该返回包含结果的新集合实例。



## 6.7 WeakSet

ECMAScript 6 新增的“弱集合”（WeakSet）是一种新的集合类型，为这门语言带来了集合数据结构。WeakSet 是 Set 的“兄弟”类型，其 API 也是 Set 的子集。WeakSet 中的“weak”（弱），描述的是 JavaScript 垃圾回收程序对待“弱集合”中值的方式。



## 6.8 迭代与扩展操作

ECMAScript 6 新增的迭代器和扩展操作符对集合引用类型特别有用。这些新特性让集合类型之间相互操作、复制和修改变得异常方便。

> 第 7 章会更详细地介绍迭代器和生成器。

如本章前面所示，有 4 种原生集合类型定义了默认迭代器：

- Array

- 所有定型数组

- Map

- Set

很简单，这意味着上述所有类型都支持顺序迭代，都可以传入 `for-of 循环`。

这也意味着所有这些类型都兼容 `扩展操作符`。扩展操作符在对可迭代对象执行 `浅复制` 时特别有用，只需简单的语法就可以复制整个对象：

```js
let arr1 = [1, 2, 3]; 
let arr2 = [...arr1]; 

console.log(arr1); // [1, 2, 3] 
console.log(arr2); // [1, 2, 3] 
console.log(arr1 === arr2); // false
```

对于期待可迭代对象的构造函数，只要传入一个可迭代对象就可以实现复制：

```js
let map1 = new Map([[1, 2], [3, 4]]); 
let map2 = new Map(map1); 

console.log(map1); // Map {1 => 2, 3 => 4} 
console.log(map2); // Map {1 => 2, 3 => 4}
```

当然，也可以构建数组的部分元素：

```js
let arr1 = [1, 2, 3]; 
let arr2 = [0, ...arr1, 4, 5]; 

console.log(arr2); // [0, 1, 2, 3, 4, 5]
```

浅复制意味着只会复制对象引用：

```js
let arr1 = [{}]; 
let arr2 = [...arr1]; 

arr1[0].foo = 'bar'; 
console.log(arr2[0]); // { foo: 'bar' }
```



上面的这些类型都支持`多种构建方法`，比如 Array.of()和 Array.from()静态方法。在与扩展操作符一起使用时，可以非常方便地实现互操作：

```js
let arr1 = [1, 2, 3]; 

// 把数组复制到定型数组
let typedArr1 = Int16Array.of(...arr1); 
let typedArr2 = Int16Array.from(arr1); 
console.log(typedArr1); // Int16Array [1, 2, 3] 
console.log(typedArr2); // Int16Array [1, 2, 3] 

// 把数组复制到映射
let map = new Map(arr1.map((x) => [x, 'val' + x])); 
console.log(map); // Map {1 => 'val 1', 2 => 'val 2', 3 => 'val 3'} 

// 把数组复制到集合
let set = new Set(typedArr2); 
console.log(set); // Set {1, 2, 3} 

// 把集合复制回数组
let arr2 = [...set]; 
console.log(arr2); // [1, 2, 3]
```

