var baseUrl = url;
var userUrl = getuserurl;
var entryId = getvalue("entryId");
var dataId = getvalue("dataId");
// var entryId = "d105238d483f61179ffd0cee8df947ff"
// var dataId = '33b2bb07d9a2474fba2d5f2bdf72c2e6';

var myform = new Vue({
    el: '#myform',
    data: {
        mainArr: [], //流程节点数组
        isAllRight: true, //整体是否通过
        form_layout: null,
        user: null,
        imglist: [],
        fileList: [],
        baseUrl: baseUrl,
        formname: null,
        list: [],
        entryId: entryId,
        dataId: dataId
    },
    created: function() {
        console.log(userUrl + '/user');

        Vue.http.get(userUrl + '/user').then(response => {
            console.log("user", response.body)
            this.user = response.body.uid;
        }, response => {
            // error callback
        });

        console.log("entryId:", this.entryId)
        console.log("dataId:", this.dataId)

        if(!this.dataId) {
            this.dataId = 0;
        }

        // 获取数据
        Vue.http.get(baseUrl + '/data/read/' + this.entryId + '/' + this.dataId).then(response => {
            console.log(response.body)
            if(response.body.error_code == 1000) {
                if(response.body.extra.form) {
                    this.form_layout = response.body.extra.form.form_layout;
                    var templist = response.body.extra.form.items;
                    this.mainArr = response.body.extra.flow_def_ui.mainArr;
                    var optAuth = this.mainArr[0].optAuth;
                    if(response.body.extra.data) {
                        var data = response.body.extra.data;
                        templist.forEach(function(listitem) {

                            //console.log("data:", data)
                            var itemdata = data[listitem.widgetName];
                            if(itemdata === "null") {
                                itemdata = '';
                                if(listitem.type == "checkboxgroup") {
                                    itemdata = [];
                                }
                            }
                            if(listitem.type == "checkboxgroup") {
                                // itemdata = itemdata.split(',');
                                itemdata = eval(itemdata);
                            } else if(listitem.type == "image" || listitem.type == "file") {
                                itemdata = eval(itemdata);
                                if(itemdata.length > 0) {
                                    var tempfilelist = [];
                                    itemdata.forEach(function(item) {
                                        var obj = {};
                                        obj.name = item.name;

                                        if(item.response) {
                                            Vue.http.get(baseUrl + '/upload/' + item.response.extra).then(response => {
                                                //console.log("response", response.url);
                                                obj.url = response.url;
                                                tempfilelist.push(obj);
                                            })
                                        } else {
                                            obj.url = item.url;
                                            tempfilelist.push(obj);
                                        }
                                    })
                                }

                                itemdata = tempfilelist;
                                listitem.filelist = itemdata;
                            } else if(listitem.type == "combo") {
                                if(listitem.label == "请假时长") {
                                    if(itemdata == "4") {
                                        listitem.value = "选项1";
                                    }
                                    if(itemdata == "8") {
                                        listitem.value = "选项2";
                                    }
                                    if(itemdata == "16") {
                                        listitem.value = "选项3";
                                    }
                                    if(itemdata == "24") {
                                        listitem.value = "1";
                                    }
                                    if(itemdata == "32") {
                                        listitem.value = "2";
                                    }
                                    if(itemdata == "40") {
                                        listitem.value = "3";
                                    }
                                    if(itemdata == "48") {
                                        listitem.value = "4";
                                    }
                                    if(itemdata == "56") {
                                        listitem.value = "5";
                                    }
                                } else {
                                    listitem.value = itemdata;
                                }
                            } else {
                                listitem.value = itemdata;
                            }
                        });
                    } else {
                        templist.forEach(function(listitem) {
                            if(listitem.type == "checkboxgroup") {
                                listitem.value = [];
                            } else if(listitem.type == "datetime") {
                                listitem.value = getNowFormatDate();
                            } else {
                                listitem.value = '';
                            }
                        });
                    }

                    //设置编辑、可见状态
                    templist.forEach(function(listitem) {
                        //                      enable:false 表示可用,true表示不可用
                        //                      visible:true 表示可见,false表示不可见

                        switch(optAuth[listitem.widgetName]) {
                            case 0:
                                {
                                    listitem.enable = true;
                                    listitem.visible = false;
                                    break;
                                }
                            case 1:
                                {
                                    listitem.enable = true;
                                    listitem.visible = false;
                                    break;
                                }
                            case 2:
                                {
                                    listitem.enable = true;
                                    listitem.visible = true;
                                    break;
                                }
                            case 3:
                                {
                                    listitem.enable = true;
                                    listitem.visible = true;
                                    break;
                                }
                            case 4:
                                {
                                    listitem.enable = false;
                                    listitem.visible = false;
                                    break;
                                }
                            case 5:
                                {
                                    listitem.enable = false;
                                    listitem.visible = false;
                                    break;
                                }
                            case 6:
                                {
                                    listitem.enable = false;
                                    listitem.visible = true;
                                    break;
                                }
                            case 7:
                                {
                                    listitem.enable = false;
                                    listitem.visible = true;
                                    break;
                                }
                        }
                    })

                    this.list = templist;
                    console.log("list", this.list)
                }
            }
        }, response => {
            // error callback
        });

    },
    methods: {
        success_text: function(response, file, fileList) {
            this.fileList = fileList;
            //console.log("response", response);
            // console.log("file", file);
            console.log("fileList", fileList);
        },
        success_img: function(response, file, fileList) {
            this.imglist = fileList;
            //console.log("response", response);
            // console.log("file", file);
            console.log("imglist", fileList);
        },
        change(file, fileList) {
            console.log("change", fileList);
            if(fileList.length > 1) {
                fileList.splice(0, 1);
            }
        },
        handleRemoveimg(file, fileList) {
            console.log(file, fileList);
            this.imglist = fileList;

        },
        handleRemovefile(file, fileList) {
            this.fileList = fileList;
            console.log(file, fileList);
        },
        handlePreview(file) {
            //console.log(file);
        },
        setValues: function() {
            // console.log("this.imglist",this.imglist);
            // console.log("this.fileList",this.fileList);
            var imglist = this.imglist;
            var fileList = this.fileList;
            var values = {};

            this.list.forEach(function(listitem) {
                var widgetName = listitem.widgetName;
                var obj = {};
                if(listitem.type == 'image') {
                    console.log("imglist", imglist);
                    console.log("listitem.imglist", listitem.filelist);
                    if(imglist.length > 0) {
                        obj["data"] = imglist;
                    } else if(listitem.filelist && listitem.filelist.length > 0) {
                        obj["data"] = listitem.filelist;
                    } else {
                        obj["data"] = [];
                    }

                } else if(listitem.type == 'file') {
                    console.log("fileList", fileList);
                    console.log("listitem.filelist", listitem.filelist);
                    if(fileList.length > 0) {
                        obj["data"] = fileList;
                    } else if(listitem.filelist && listitem.filelist.length > 0) {
                        obj["data"] = listitem.filelist;
                    } else {
                        obj["data"] = [];
                    }

                } else if(listitem.type == 'combo') {
                    //"请假时长"名字要跟表单设计页面标签名字一致
                    if(listitem.label == "请假时长") {
                        if(listitem.value == "选项1") {
                            obj["data"] = 4;
                        } else if(listitem.value == "选项2") {
                            obj["data"] = 4 * 2;
                        } else if(listitem.value == "选项3") {
                            obj["data"] = 4 * 4;
                        } else if(listitem.value == "1") {
                            obj["data"] = 4 * 6;
                        } else if(listitem.value == "2") {
                            obj["data"] = 4 * 8;
                        } else if(listitem.value == "3") {
                            obj["data"] = 4 * 10;
                        } else if(listitem.value == "4") {
                            obj["data"] = 4 * 12;
                        } else if(listitem.value == "5") {
                            obj["data"] = 4 * 14;
                        }
                    } else {
                        obj["data"] = listitem.value;
                    }
                } else {
                    obj["data"] = listitem.value;
                }
                obj.type = listitem.type;
                values[widgetName] = obj;
            });
            return values;
        },
        checkform: function(value, strNote, id, checktype) {
            var isRight = true; //针对单独的某一项判断是否通过
            var _this = $("#" + id);
            _this.text(); //提示内容重置
            console.log("value--1", value)
            if(checktype == "非空") {
                if(value || value.length > 0) {
                    isRight = true;
                    _this.hide();
                } else {
                    isRight = false;
                    _this.show();
                    _this.text(strNote + "不能为空");
                }
            } else if(checktype == "整数") {
                //console.log("checkRst--1", /^[0-9]*[1-9][0-9]*$/.test(value));
                var checkRst = /^[0-9]*[1-9][0-9]*$/.test(value);
                if(checkRst) {
                    isRight = true;
                    _this.hide();
                } else {
                    isRight = false;
                    _this.show();
                    _this.text("请输入整数数字");
                }
            }

            if(this.isAllRight && isRight == false) {
                this.isAllRight = false;
            }

        },
        getValidate: function() {
            this.isAllRight = true; //每次提交都初始化为true

            console.log("this.imglist", this.imglist);
            console.log("this.fileList", this.fileList);
            var imglist = this.imglist;
            var filelist = this.fileList;

            for(var i = 0; i < this.list.length; i++) {
                var listitem = this.list[i];
                var id = listitem.type + i;
                console.log("listitem--1", listitem);
                //非空验证
                if(listitem.allowBlank) {
                    //上传表单验证
                    if(listitem.type == "file") {
                        if(listitem.filelist.length > 0) {
                            filelist = listitem.filelist;
                        }
                        //console.log("filelist--1", filelist);
                        this.checkform(filelist, listitem.label, id, "非空");
                    } else if(listitem.type == "image") {
                        if(listitem.filelist.length > 0) {
                            imglist = listitem.filelist;
                        }
                        //console.log("imglist--1", imglist);
                        this.checkform(imglist, listitem.label, id, "非空");
                    } else {
                        this.checkform(listitem.value, listitem.label, id, "非空");
                    }
                }
                //整数验证
                if(this.isAllRight && listitem.allowBlank && listitem.dataType == "int") {
                    this.checkform(listitem.value, listitem.label, id, "整数");
                }
            }
        },
        creat: function(type) {
            //表单验证
            this.getValidate();
            console.log("isAllRight1--", this.isAllRight)
            if(this.isAllRight) {
                //验证通过

                var ifCommit;
                if(type === 'creat') {
                    ifCommit = 1;
                } else if(type === 'save') {
                    ifCommit = 0;
                }

                var values = this.setValues();
                console.log("values", values)
                var data = {
                    "ifCommit": ifCommit,
                    "values": values,
                    "entryId": this.entryId
                }
                if(this.dataId && this.dataId != 0) {
                    data.dataId = this.dataId;
                }
                console.log("1111data", data)
                console.log("user", this.user)
                if(this.user) {
                    // 表单数据提交
                    Vue.http.post(baseUrl + '/data/create', JSON.stringify(data, null, 4), {
                        headers: {
                            union_id: this.user
                        }
                    }).then(response => {
                        console.log(response.body)
                        if(response.body.error_code == 1000) {
                            //this.dataId = response.body.extra;
                            window.parent.location.reload();
                        } else {
                            this.$message({
                                message: response.body.error_msg,
                                type: 'error'
                            });
                        }
                    }, response => {
                        console.log("error:", response)
                    });
                }
            }
        },
        deleteform: function() {
            // 表单数据提交
            Vue.http.delete(baseUrl + '/data/tempsave/' + this.entryId + '/' + this.dataId, {}, {
                headers: {
                    union_id: this.user
                }
            }).then(response => {
                console.log(response.body)
                if(response.body.error_code == 1000) {
                    //this.dataId = response.body.extra;
                    window.parent.location.reload();
                } else {
                    this.$message({
                        message: response.body.error_msg,
                        type: 'error'
                    });
                }
            }, response => {
                console.log("error:", response)
            });
        }
    }
})

var winH = $(window).height();
var contH = winH - 160;
$(".form-cont").css({
    "maxHeight": contH
});