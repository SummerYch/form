var baseUrl = url;
var uuid = uuid(8, 16);
var entryId = getvalue("entryId");
var list = listarr;

var wrap = new Vue({
    el: '#wrap',
    data: {
        form_layout_opt: [{
            value: 'form_layout1',
            label: '1/2'
        }, {
            value: 'form_layout2',
            label: '全部'
        }],
        form_layout: "单列",
        showalert: false,
        labelDisp: ["在左面", "在上面", "不显示"],
        lineTypes: ["solid", "dotted", "dashed", "double"],
        dateformats: [ //日期控件-日期格式
            {
                "text": "年-月-日",
                "formatvalue": "format1"
            },
            {
                "text": "年-月-日-时-分",
                "formatvalue": "format2"
            }
        ],
        desc: null, //表单描述
        formName: null, //表单名称
        iframesrc: null,
        entryId: entryId, //表单id
        isdel: false,
        clickindex: null, //选中索引
        isHot: "hot", //选中添加hot class
        addValue: 0, //增加选项的value值
        attribute: null, //属性栏中间变量对象
        activeName: 'first',
        attrname: 'attr2',
        list: list,
        list2: []
    },
    created: function() {
        //获取表单
        Vue.http.get(baseUrl + '/form/' + this.entryId).then(response => {
            if(response.body.error_code == 1000) {
                console.log("获取表单", response.body);
                if(response.body.extra) {
                    this.formName = response.body.extra.name;
                    this.desc = response.body.extra.desc;
                    if(response.body.extra.content) {
                        var list2arr = response.body.extra.content.items;
                        list2arr.forEach(function(element) {
                            if(element.type === "separator") {
                                element.label = null;
                            }
                        }, this);

                        this.form_layout = response.body.extra.content.form_layout;
                        this.list2 = list2arr;
                        console.log("list2", this.list2)
                    }
                }
            }

        }, response => {
            // error callback
        });
        this.iframesrc = "../flowchart/index.html?entryId=" + this.entryId; //本地
        //this.iframesrc = baseUrl + "/workflow/flowchart/index.html?entryId=" + this.entryId;
        //this.iframesrc = "../../../workflow/flowchart/index.html?entryId=" + this.entryId;  //线上

    },
    methods: {
        change(file, fileList) {
            //console.log("change",fileList);
            if(fileList.length > 1) {
                fileList.splice(0, 1);
            }
        },
        handleRemove(file, fileList) {
            console.log(file, fileList);
        },
        handlePreview(file) {
            console.log(file);
        },
        handleCommand(command) {
            this.$message('click on item ' + command);
        },
        handleClick(tab, event) {
            //console.log("11111111--",tab, event);
            if(tab.index == 1) {
                document.getElementById('iframeId').contentWindow.getform();
                //              $("#flowtab").empty(); //内容重置
                //              $("#flowtab").append('<iframe class="iframe" src="'+this.iframesrc+'" frameborder="0" style="height:'+(winH - 50)+'px"></iframe>')
            }
        },
        dateformate_sel: function(value) {
            if(value == "format2") {
                console.log("attribute", this.attribute);
                var d = new Date();
                var datenow = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes();
                this.attribute.value.sys = datenow;
            }
        },
        //预览
        view: function() {
            if(this.attribute) {
                this.attribute.filelist = [];
            }
        },
        endDrag: function() {
            // this.canDrag=null;
            // this.targetElement=null;
            // this.futureIndex =null;
            console.log("end", this.list2)
            if(this.list2.length > 0) {
                var templist = this.list2;
                templist.forEach(function(element) {
                    if(element.type === "separator") {
                        element.label = null;
                        element.Disp = "不显示";
                    }
                }, this);
                this.list2 = templist;
            }
            this.checkItem(this.list2[this.list2.length - 1], this.list2.length - 1)
        },
        startDrag: function(evt) {
            //console.log(evt);
            //console.log("start")
        },
        //选中表单
        checkItem: function(element, index) {
            //console.log(index);

            this.attribute = element;
            console.log("attribute:", this.attribute)
            this.clickindex = index;
            this.attrname = 'attr1';
        },
        //删除表单
        delItem: function(index) {
            console.log(index);
            this.list2.splice(index, 1)
        },
        inputblur: function(item, index) {
            var tempitems = this.attribute.items;
            var temptext = item.text;
            tempitems.forEach(function(element, eachindex) {
                if(temptext === element.text && index != eachindex) {
                    temptext = "";
                    this.showalert = true;
                    setTimeout(() => {
                        this.showalert = false
                    }, 2000);
                }
            }, this);
            console.log("text2", temptext);
            item.text = temptext;
        },
        //增加select表单选项
        addOption: function() {
            this.addValue++;
            this.attribute.items.push({
                "text": "",
                "value": (this.addValue).toString()
            });
            console.log("attribute.items", this.attribute.items)
        },
        //删除select表单选项
        delOption: function(index) {
            this.attribute.items.splice(index, 1)
        },
        save: function() {
            //console.log("list2:", this.list2)
            //修改表单
            var data = {
                "name": this.formName,
                "content": {
                    "type": "form",
                    "items": this.list2,
                    "validators": [

                    ],
                    "submitRule": 1,
                    "form_layout": this.form_layout
                },
                "hasCache": false
            }
            console.log("data:", data);
            this.$http.put(baseUrl + '/form/' + this.entryId, JSON.stringify(data, null, 4)).then(response => {
                console.log(response.body)
                if(response.body.error_code == 1000) {
                    this.$message({
                        message: '恭喜你，保存成功',
                        type: 'success'
                    });
                } else {
                    this.$message({
                        message: response.body.error_msg,
                        type: 'error'
                    });
                }
            }, response => {
                // error callback
            });

        }
    }
})

var winH = $(window).height();
var contH = winH - 44;
$(".formcolLwrap,.formcolRwrap").css({
    "minHeight": contH
});
$(".formcolMwrap,.formcolRwrap").css({
    "maxHeight": contH
});
$(".dragtoArea").css({
    "minHeight": contH - 100
});

$("#flowtab .iframe").css({
    "minHeight": winH - 50
    //  "minHeight": winH - 115
});
$("#flowtab .iframe").css({
    "maxHeight": winH - 50
    //  "maxHeight": winH - 115
});