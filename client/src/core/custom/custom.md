# 标记（Custom）

## 标记类型

在RESGS中标记类为Custom，意为自定义的。

目前可以使用Custom的对象包含：
房间（**GameRoom**）
玩家（**GamePlayer**）
技能（**Skill**）
游戏牌（**GameCard**）
虚拟牌（**VirtualCard**）
武将牌（**General**）


### 自定义数据 CustomData

CustomData是自定义数据，这些数据可以是任意类型的，但是这些数据不会被同步到客户端。所以它通常用来处理与客户端无关的逻辑。

如果你需要使用一个全局变量，把它加入到**房间对象**下是一个更好的做法。

>设置一个自定义数据，返回值为该值本身  
setData\<ValueType extends any\>(key:string,value:ValueType):ValueType  
其中ValueType为值的类型，你可以在泛型（详情参考typescript文档）中指定类型来享受更好的代码提示。  

>获取一个自定义数据  
getData\<ValueType extends any\>(key:string):ValueType  

>删除一个自定义数据，返回值为被删除的值  
removeData\<ValueType extends any\>(key:string):ValueType  

>是否含有数据，返回值为布尔值，表示是否含有对应的数据  
hasData\<ValueType extends any\>(key:string):boolean  
注意：这个方法检测的是自定义数据中是否含有指定“键”，而非该“键”对应的值。即假设某玩家下拥有一个key为a，值为false(boolean)的自定义数据，该方法会返回true

### 自定义标记（Mark）
Mark是可以被同步到客户端的自定义数据，所以它的值只能是基础类型（string,number,boolean）。  

Mark的相关方法与Data一致，但将函数名中的Data改为Mark  
同样的，在判断是否有相关标记时，检测的是键，而非值。且一个number类型的标记在被设置为0或减少至0以下时，该标记不会自动删除。  
除此之外，Mark还拥有以下两个便捷方法

>将一个number类型的标记加指定的值，返回值为增加后的值  
increaseMark(key:string,value:number=1):number  
如果该标记不存在，则会直接将该标记设置为对应的值

>将一个number类型的标记减指定的值，返回值为减少后的值  
reduceMark(key:string,value:number=1):number  
如果该标记不存在，则会直接将该标记设置为对应的值的负数

### UI与Mark
Mark的键名也会用来处理一些UI显示相关的逻辑。但在不同的对象下，处理的逻辑是不同的。以下说明中，均表示键名由“@……:”开头在UI中的显示逻辑

#### 房间类
1.@img  
以@img:开头的标记，值必须为字符串(string)，该值指向一个图片资源文件，它会被显示在页面的正中间。参考十周年服的鏖战，文和乱武等模式中间所显示的图片。  
这个图片最多显示一个，只会显示最新被设置的图片。

2.@img_prompt，值必须为字符串，@img对应的图片上显示一个问号按钮，通过点击它可以查看该值提供的相关说明

#### 玩家类
1.@number 值必须为number类型，它会在对应玩家的脸上显示“标记名[标记数量]”

2.@string 值必须为string类型，它会在对应的玩家的脸上显示“标记名[值]”

3.@cards 值为固定顺序拼接的字符串 “{牌标记名}:{区域ID}”，它会在对应玩家的脸上显示“标记名[对应牌的数量]”，同时可以点击查看这些牌。这些牌指的是在对应区域里拥有对应标记名的牌。

4.@generals 与@cards一致，但显示的武将牌

5.@img 该值指向一个图片资源，显示方式会变为对应的图片标记资源，其中资源的寻址逻辑为@img后面的内容。值可以任意类型，如果是number类型还会在标记的右下角显示数量。其他类型则只会显示图片。

6.@prompt 该值被翻译后会以更大的字显示在对应玩家的脸上，但这些并没有实际作用，在每次选择完成后，这些标记会被自动清理掉。参考手杀中的一些傻瓜提示，例如离间中选择后会提示哪名玩家是先出杀的。