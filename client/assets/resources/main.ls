{
  "_$ver": 1,
  "_$id": "q3bgp1n9",
  "_$runtime": "res://7f02f48b-4889-4dc2-8c72-41adfe1ade57",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "main",
  "width": 1920,
  "height": 1080,
  "mouseThrough": true,
  "_$comp": [
    {
      "_$type": "186815b3-52b6-46ef-b873-9f65b105248d",
      "scriptPath": "../src/Main.ts"
    }
  ],
  "_$child": [
    {
      "_$id": "gf4w1lbo",
      "_$type": "GWidget",
      "name": "widget",
      "width": 1920,
      "height": 1080,
      "relations": [
        {
          "_$type": "Relation",
          "data": [
            1,
            0,
            2,
            0
          ]
        }
      ],
      "_$child": [
        {
          "_$id": "i4ggdatw",
          "_$var": true,
          "_$type": "GWidget",
          "name": "pool",
          "width": 1920,
          "height": 1080,
          "visible": false,
          "relations": [
            {
              "_$type": "Relation",
              "data": [
                6,
                0,
                13,
                0
              ]
            }
          ]
        },
        {
          "_$id": "eyg1c5h4",
          "_$var": true,
          "_$type": "GWidget",
          "name": "layers",
          "width": 1920,
          "height": 1080,
          "mouseThrough": true,
          "drawCallOptimize": true,
          "relations": [
            {
              "_$type": "Relation",
              "data": [
                6,
                0,
                13,
                0
              ]
            }
          ]
        },
        {
          "_$id": "gv43hp53",
          "_$var": true,
          "_$type": "GWidget",
          "name": "windows",
          "width": 1920,
          "height": 1080,
          "visible": false,
          "_$child": [
            {
              "_$id": "vnpgqbm2",
              "_$var": true,
              "_$type": "GWidget",
              "name": "prompt",
              "x": 710,
              "y": 397,
              "width": 500,
              "height": 286,
              "visible": false,
              "_$child": [
                {
                  "_$id": "zrqri83j",
                  "_$type": "GImage",
                  "name": "bg",
                  "width": 500,
                  "height": 286,
                  "src": "res://8d07c836-a981-4af7-8ea1-1fbad99880d2",
                  "autoSize": false
                },
                {
                  "_$id": "g5pyhi44",
                  "_$var": true,
                  "_$type": "GTextField",
                  "name": "prompt_title",
                  "width": 500,
                  "height": 212,
                  "mouseThrough": true,
                  "relations": [
                    {
                      "_$type": "Relation",
                      "data": [
                        1,
                        0,
                        10,
                        0
                      ]
                    }
                  ],
                  "text": "游戏设置",
                  "font": "res://d90effa0-fe20-4203-b0d9-705db9aa4921",
                  "fontSize": 30,
                  "color": "#FFFFFF",
                  "ubb": true,
                  "templateVars": true,
                  "align": "center",
                  "valign": "middle"
                },
                {
                  "_$id": "t13r6il4",
                  "_$prefab": "1dd1b68b-7014-4f25-b642-e20a3cbb4713",
                  "_$var": true,
                  "name": "prompt_confirm",
                  "active": true,
                  "x": 103,
                  "y": 221,
                  "visible": true,
                  "width": 91,
                  "height": 54,
                  "title": "确定",
                  "titleFontSize": 30
                },
                {
                  "_$id": "pt3xugpk",
                  "_$prefab": "1dd1b68b-7014-4f25-b642-e20a3cbb4713",
                  "_$var": true,
                  "name": "prompt_cancle",
                  "active": true,
                  "x": 309,
                  "y": 221,
                  "visible": true,
                  "width": 91,
                  "height": 54,
                  "title": "取消",
                  "titleFontSize": 30
                }
              ]
            }
          ]
        },
        {
          "_$id": "5v595pua",
          "_$var": true,
          "_$type": "GWidget",
          "name": "model",
          "width": 1920,
          "height": 1080,
          "relations": [
            {
              "_$type": "Relation",
              "data": [
                6,
                0,
                13,
                0
              ]
            }
          ],
          "_$child": [
            {
              "_$id": "438nxy6f",
              "_$prefab": "e82be42b-85ee-4624-a8cd-d885ec6a9eec",
              "_$var": true,
              "name": "loading",
              "active": true,
              "x": 0,
              "y": 0,
              "visible": false
            }
          ]
        },
        {
          "_$id": "qx51qs8v",
          "_$var": true,
          "_$type": "GWidget",
          "name": "tips",
          "width": 1920,
          "height": 1080,
          "mouseThrough": true,
          "relations": [
            {
              "_$type": "Relation",
              "data": [
                6,
                0,
                13,
                0
              ]
            }
          ]
        }
      ]
    }
  ]
}