require.config({
    paths: {
        "art-template": "lib/template",
        "host": "host"
    }
});
define(function(require, exports, module) {
    var self = exports;
    var template = require('art-template');
    var host = require('host');
    var entryId = getvalue("entryId");

    //初始化一个jsPlumb实例
    var instance = jsPlumb.getInstance();

    var tabid;
    //节点计数器
    var nodeCounter = 0;
    var mainArr = []; //节点数组
    var connects = []; //线数组
    var attribute = null;
    var formcontent = []; //表单内容
    var optAuth = null; //操作权限数据
    var widgetvalue = []; //操作权限每个表单对应选项数组
    var widgetName = '';
    var editall = false;
    var viewall = false;

    var rulesvalue = "rule1"; //流转规则
    var remindvalue = []; //节点属性提醒方式
    
    var flowremindvalue = []; //流程属性提醒方式
    var flowback = []; //流程属性撤回

    self.init = function() {
        //      设置布局样式
        var winH = $(window).height();

        $(".container").css({
            "minHeight": winH - 55
        });
        $(".container").css({
            "maxHeight": winH - 55
        });

        //      初始化流程图
        initflow();

        //      获取表单
        getform();

    };

    $("#save").on("click", function() {
        var isOn = 0;
        var obj = {};
        obj.isOn = isOn;
        obj.mainArr = mainArr;
        obj.connects = connects;
        obj.flowremindvalue=flowremindvalue;
        obj.flowback=flowback;
        console.log("saveobj", obj);

//      $.ajax({
//          type: "PUT",
//          async: false,
//          url: url + "/form/" + entryId + "/flow",
//          beforeSend: function(request) {
//              request.setRequestHeader('Content-Type', 'application/json');
//          },
//          data: JSON.stringify(obj, null, 4),
//
//          dataType: "json",
//          error: function() {
//              console.log('请求失败');
//          },
//          success: function(data) {
//              console.log("save", data.error_msg);
//          }
//      });
    })

    $("#saveuse").on("click", function() {
        var isOn = 1;
    })

    function getform() {
        var widgetName; //字段id
        $.ajax({
            type: "GET",
            async: false,
            url: url + "/form/" + entryId,
            beforeSend: function(request) {
                request.setRequestHeader('Content-Type', 'application/json');
            },
            data: {},
            dataType: "json",
            error: function() {

            },
            success: function(data) {
                console.log("获取表单字段", data);
                if(data.error_code == 1000 && data.extra && data.extra.content) {
                    formcontent = data.extra.content.items;
                }
            }
        });

    }

    //取消权限全选
    function removePropertyAll(flag, widgetName) {
        var id = widgetName;
        var edit_optAuth = optAuth;
        if(flag == "_1") {
            editall = false;
            $("#edit_1").removeAttr("checked");
        }
        if(flag == "_2") {
            viewall = false;
            $("#view_2").removeAttr("checked");
        }
        if(widgetName == "removePropertyAll") {
            for(var i = 0; i < formcontent.length; i++) {
                var edit_widgetName = formcontent[i].widgetName;
                var ids = edit_optAuth[edit_widgetName];
                var index = ids.indexOf(edit_widgetName + flag);
                if(index >= 0) {
                    ids.splice(index, 1);
                    edit_optAuth[edit_widgetName] = ids;
                    $("#" + edit_widgetName + flag).removeAttr("checked");
                }
            }
        } else {
            var ids = edit_optAuth[id];
            var index = ids.indexOf(id + flag);
            ids.splice(index, 1);
            edit_optAuth[id] = ids;
            $("#" + id + flag).removeAttr("checked");
        }

        attribute.editall = editall;
        attribute.viewall = viewall;
        attribute.optAuth = edit_optAuth;
        console.log("attribute.optAuth", JSON.stringify(attribute.optAuth));
        mainArr[mainArrindex]=attribute;
    }

    //    操作权限，全选
    $("#tabnode").on("click", ".lihead input", function() {
        var id = $(this).attr("id");
        var flag = id.substr(4, 2);
        if($(this).is(':checked')) {
            if(flag == "_1") {
                editall = true;
            }
            if(flag == "_2") {
                viewall = true;
            }
            var edit_optAuth = optAuth;
            console.log("edit_optAuth", edit_optAuth);
            var edit_widgetName;

            for(var i = 0; i < formcontent.length; i++) {
                edit_widgetName = formcontent[i].widgetName;
                if(edit_optAuth[edit_widgetName]) {
                    var ids = edit_optAuth[edit_widgetName];
                    var index = ids.indexOf(edit_widgetName + flag);
                    if(index < 0) {
                        ids.push(edit_widgetName + flag);
                        edit_optAuth[edit_widgetName] = ids;
                    }
                } else {
                    var arr = [];
                    arr.push(edit_widgetName + flag);
                    edit_optAuth[edit_widgetName] = arr;
                }
                $("#" + edit_widgetName + flag).prop("checked", true);
            }

            attribute.optAuth = edit_optAuth;
            console.log("attribute.optAuth", JSON.stringify(attribute.optAuth));

        } else {
            removePropertyAll(flag, "removePropertyAll");
        }
        attribute.editall = editall;
        attribute.viewall = viewall;
        mainArr[mainArrindex]=attribute;
    })

    //设置操作权限checkbox的选中项
    function setOptCheckbox(checkboxname) {
        var len = $(".property li").length;
        for(var i = 0; i < len; i++) {
            var eleid = $(".property li").eq(i).attr("id");
            setCheckbox(eleid, checkboxname);
        }
    }

    //设置checkbox的选中项
    function setCheckbox(eleid, checkboxname) {
        var dataids = $("#" + eleid).find("." + checkboxname).attr("data-id");
        console.log("dataids", dataids)
        if(!dataids) {
            return;
        } else {
            console.log("提醒方式", JSON.parse(dataids))
            var dataidsarr = JSON.parse(dataids)
            dataidsarr.forEach(function(item, index) {
                console.log(item);
                $("#" + eleid).find("." + checkboxname).find("input[id=" + item + "]").prop("checked", true);
            })
        }
    }

    //设置radio的选中项
    function setRadio(radioname) {
        var dataid = $("." + radioname).attr("data-id");
        $("." + radioname).find("input[id=" + dataid + "]").prop("checked", true);
    }

    //    打开modal,添加负责人
    $("#tabnode").on("click", ".add_contact", function() {

    })
    
    // 流程属性提醒方式checkbox选择事件
    $("#tabnode").on("click", ".checkbox-flowback input", function(e) {
        var id = $(this).attr("id");
        if($(this).is(':checked')) {
            $(this).prop("checked", true)
            flowback.push(id)
        } else {
            $(this).removeAttr("checked");
            for(var i = 0; i < flowback.length; i++) {
                if(flowback[i] == id) {
                    flowback.splice(i, 1);
                    break;
                }
            }
        }
    })

    // 流程属性提醒方式checkbox选择事件
    $("#tabnode").on("click", ".checkbox-flowremind input", function(e) {
        var id = $(this).attr("id");
        if($(this).is(':checked')) {
            $(this).prop("checked", true)
            flowremindvalue.push(id)
        } else {
            $(this).removeAttr("checked");
            for(var i = 0; i < flowremindvalue.length; i++) {
                if(flowremindvalue[i] == id) {
                    flowremindvalue.splice(i, 1);
                    break;
                }
            }
        }
    })
    
    // 流转规则radio选择事件
    $("#tabnode").on("click", ".radio-rules input", function(e) {
        if($(this).is(':checked')) {
            var rulesval = $(this).attr("id");
            attribute.rulesvalue = rulesval;
            mainArr[mainArrindex]=attribute;
        }
    })

    // 提醒方式checkbox选择事件
    $("#tabnode").on("click", ".checkbox-remind input", function(e) {
        var id = $(this).attr("id");
        if($(this).is(':checked')) {
            $(this).prop("checked", true)
            remindvalue.push(id)
        } else {
            $(this).removeAttr("checked");
            for(var i = 0; i < remindvalue.length; i++) {
                if(remindvalue[i] == id) {
                    remindvalue.splice(i, 1);
                    break;
                }
            }
        }
        attribute.remindvalue = remindvalue;
        console.log("attribute.remindvalue", JSON.stringify(attribute.remindvalue));
        mainArr[mainArrindex]=attribute;
    })

    // 操作权限checkbox选择事件
    $("#tabnode").on("click", ".property li input", function(e) {

        var tempname = $(this).parents("li").attr("id");
        //console.log("tempname", tempname);
        if(tempname != widgetName) {
            widgetName = tempname;
        }
        if(!optAuth[widgetName]) {
            widgetvalue = [];
        } else {
            widgetvalue = optAuth[widgetName];
        }

        var id = $(this).attr("id");
        var flag = id.substr(id.length - 2, 2);
        if($(this).is(':checked')) {
            widgetvalue.push(id);
            $(this).prop("checked", true)
        } else {
            removePropertyAll(flag, widgetName)
            $(this).removeAttr("checked");
            for(var i = 0; i < widgetvalue.length; i++) {
                if(widgetvalue[i] == id) {
                    widgetvalue.splice(i, 1);
                    break;
                }
            }
        }

        optAuth[widgetName] = widgetvalue;

        attribute.optAuth = optAuth;
        console.log("attribute.optAuth", JSON.stringify(attribute.optAuth));
        mainArr[mainArrindex]=attribute;
    })

    var nodeflagname;
    var mainArrindex;  //修改节点属性索引
    // 节点点击事件
    $("#container").on("click", ".item", function(e) {
        $(this).addClass("node_selected");
        $(this).siblings().removeClass("node_selected");
        $("#node").addClass("hot").siblings(".tabitem").removeClass("hot");
        $(".tab-bar").removeClass("sel");
        $("#tabnode").show().siblings(".tabcont").hide();
        $("#tabnode").empty();
        tabid = "tabnode";

        var nodename = $(this).text();
        if(nodename != nodeflagname) {
            nodeflagname = nodename;
            attribute = {};

            mainArr.forEach(function(item, index) {
                if(nodeflagname == item.name) {
                    attribute=item;
                    mainArrindex=index;
                    if(item.optAuth) {
                        optAuth = item.optAuth;
                    } else {
                        optAuth = null;
                    }

                    if(item.remindvalue) {
                        remindvalue = item.remindvalue;
                    } else {
                        remindvalue = [];
                    }
                    
                    if(item.type==1){
                        if(item.rulesvalue){
                            rulesvalue=item.rulesvalue;
                        }
                        attribute.rulesvalue = rulesvalue;
                    }
                }
            })

            attribute.name = nodename;
            attribute.formcontent = formcontent;

            //设置默认选项值
            attribute.optAuth = optAuth;
            attribute.remindvalue = remindvalue;
        }

        //      数据重置
        //      optAuth = null;
        //      remindvalue = [];

        var html = template('node_attr', {
            attribute: attribute
        })
        console.log("切换--attribute", attribute)
        $("#tabnode").append(html);

        setRadio("radio-rules"); //流转规则
        setCheckbox("remind", "checkbox-remind"); //提醒方式
        setOptCheckbox("checkbox-property"); //操作权限

        //      对象初始化
        if(!optAuth) {
            optAuth = {};
        }
    })

    $("#container").on("mouseenter", ".item", function() {
        //除开始节点外的出现删除按钮
        if($(this).attr("data-index") > 0) {
            var ele = $('<i class="fa fa-close delete"></i>');
            ele.css({});
            $(this).append(ele);
        }
    }).on("mouseleave", ".item", function() {
        $(".delete").remove();
    }).on("click", ".delete", function() {
        if(confirm("确定删除吗?")) {
            var sign = $(this).parent().attr("data-sign");
            var nodeid = $(this).parent().attr("id");

            //删除节点
            instance.removeAllEndpoints(nodeid);
            $(this).parent().remove();

            //删除节点数组
            for(var i = 0; i < mainArr.length; i++) {
                if(mainArr[i].index == sign) {
                    mainArr.splice(i, 1);
                    break;
                }
            }
            //删除线段
            for(var i = 0; i < connects.length; i++) {
                if(connects[i].originIndex == sign || connects[i].destinationIndex == sign) {
                    connects.splice(i, 1);
                    break;
                }
            }
            console.log("mainArr", mainArr);
            console.log("connects", connects);
        }
    });

    //属性tab切换动画
    $(".flowtabs").on("click", ".tabitem", function() {
        var tabitemid = $(this).attr("id");
        if(tabid != tabitemid) {
            var bar = $(".tab-bar");
            tabid = tabitemid;
            $(this).addClass("hot").siblings(".tabitem").removeClass("hot");
            if($(bar).hasClass("sel")) {
                $(bar).removeClass("sel");
            } else {
                $(bar).addClass("sel")
            }
            $("#tab" + tabid).show().siblings(".tabcont").hide();
        }
    })

    //监听新的连接
    instance.bind("connection", function(info) {
        //console.log("info", info);
        var newconnect = info;
        var connection = newconnect.connection;
        var sourceId = newconnect.sourceId;
        var targetId = newconnect.targetId;

        var find = false;
        for(var index in connects) {
            if(connects[index].sourceId == sourceId && connects[index].targetId == targetId) {
                find = true;
                break;
            }
        }
        if(find == false) {
            connects.push({
                originIndex: $("#" + sourceId).attr("data-sign"),
                destinationIndex: $("#" + targetId).attr("data-sign"),
                sourceId: sourceId,
                targetId: targetId
            });
        }
    })

    //设置端点样式
    var connectorPaintStyle = { //基本连接线样式
        lineWidth: 2,
        strokeStyle: "#61B7CF",
        joinstyle: "round",
        outlineColor: "white",
        outlineWidth: 0,
    };

    var connectorHoverStyle = { // 鼠标悬浮在连接线上的样式
        lineWidth: 3,
        strokeStyle: "#216477",
        outlineColor: "white",
        outlineWidth: 0,
    };
    var origin = { //起点
        endpoint: ["Dot", {
            radius: 5
        }], //端点的形状
        connectorStyle: connectorPaintStyle, //连接线的颜色，大小样式
        connectorHoverStyle: connectorHoverStyle,
        paintStyle: {
            strokeStyle: "#1e8151",
            fillStyle: "transparent",
            radius: 4,
            lineWidth: 2
        }, //端点的颜色样式
        anchor: [0.5, 1.15],
        isSource: true, //是否可以拖动（作为连线起点）
        connector: ["Flowchart", {
            stub: 30,
            gap: [0, 18], //线与端点之间的间隙
            cornerRadius: 5,
            alwaysRespectStubs: true
        }], //连接线的样式种类有[Bezier],[Flowchart],[StateMachine ],[Straight ]
        isTarget: false, //是否可以放置（连线终点）
        maxConnections: -1, // 设置连接点最多可以连接几条线,-1表示无限大
        connectorOverlays: [
            ["Arrow", {
                width: 10,
                length: 10,
                location: 1,
                direction: 1
            }]
        ]

    };
    var destination = { //终点
        endpoint: ["Rectangle", {
            width: 74,
            height: 34
        }], //端点的形状
        connectorStyle: connectorPaintStyle, //连接线的颜色，大小样式
        connectorHoverStyle: connectorHoverStyle,
        paintStyle: {
            strokeStyle: "transparent",
            fillStyle: "transparent",
        }, //端点的颜色样式
        anchor: [0.5, 0.5],
        isSource: false, //是否可以拖动（作为连线起点）
        isTarget: true, //是否可以放置（连线终点）
        maxConnections: -1 // 设置连接点最多可以连接几条线,-1表示无限大
    };

    function deepCopy(p, c) { //克隆对象
        var c = c || {};
        for(var i in p) {
            if(!p.hasOwnProperty(i)) {
                continue;
            }
            if(typeof p[i] === 'object') {
                c[i] = (p[i].constructor === Array) ? [] : {};
                deepCopy(p[i], c[i]);
            } else {
                c[i] = p[i];
            }
        }
        return c;
    }

    function initflow() {
        $.ajax({
            type: "GET",
            async: false,
            url: url + "/form/" + entryId + "/flow",
            beforeSend: function(request) {
                request.setRequestHeader('Content-Type', 'application/json');
            },
            data: {},
            dataType: "json",
            error: function() {
                console.log('请求失败');
            },
            success: function(data) {
                //console.log("data", data);

                var mainHTML = '';
                //第一次创建流程时
                var not_have = "extra" in data;
                if(data.error_code == 1000 && !not_have) {

                    data.extra = {
                        "mainArr": [],
                        "connects": []
                    };

                    var width = $("#container").width();
                    data.extra.mainArr.push({
                        offset: {
                            top: 100,
                            left: width / 2.27
                        },
                        name: "流程发起",
                        type: "start",
                        index: 0,
                    }, {
                        offset: {
                            top: 200,
                            left: width / 2.27
                        },
                        name: "一级审批",
                        type: 1,
                        index: 1,
                    }, {
                        offset: {
                            top: 300,
                            left: width / 2.27
                        },
                        name: "二级审批",
                        type: 1,
                        index: 2,
                    }, {
                        offset: {
                            top: 400,
                            left: width / 2.27
                        },
                        name: "流程结束",
                        type: "end",
                        index: 3,
                    });
                    mainArr = data.extra.mainArr;
                    data.extra.connects.push({
                        "originIndex": "0",
                        "destinationIndex": "1",
                        "sourceId": "jsPlumb_2_1",
                        "targetId": "jsPlumb_2_4"
                    }, {
                        "originIndex": "1",
                        "destinationIndex": "2",
                        "sourceId": "jsPlumb_2_4",
                        "targetId": "jsPlumb_2_9"
                    }, {
                        "originIndex": "2",
                        "destinationIndex": "3",
                        "sourceId": "jsPlumb_2_9",
                        "targetId": "jsPlumb_2_14"
                    })
                    connects = data.extra.connects;
                }
                //后台获取流程数据
                if(data.error_code == 1000 && data.extra && data.extra.mainArr) {
                    //                                                          optAuth={"_widget_1504773099157":["_widget_1504773099157_1"],"_widget_1504773101464":["_widget_1504773101464_1","_widget_1504773101464_2","_widget_1504773101464_3"]}
                    //remindvalue=["remind1","remind2"];

                    mainArr = data.extra.mainArr;
                    console.log("mainArr", mainArr)
                    for(var i = 0; i < mainArr.length; i++) {
                        if(i == mainArr.length - 1) {
                            nodeCounter = mainArr[i].index;
                        }
                        mainHTML += '<div class="item" data-sign="' + mainArr[i].index + '"  data-index="' + mainArr[i].type + '" style="left:' + mainArr[i].offset.left + 'px;top:' + (mainArr[i].offset.top) + 'px;position:absolute;z-index: 100" >' + mainArr[i].name + '</div>';
                    };

                    $("#container").append(mainHTML);

                    $("#container .item").each(function() {
                        instance.addEndpoint(this, {
                            anchors: "BottomCenter"
                        }, deepCopy(origin, {
                            uuid: $(this).attr("data-sign") + "origin"
                        })); //起点
                        if($(this).attr("data-sign") > 0) { //开始节点不设接入端点
                            instance.addEndpoint(this, {
                                anchors: "TopCenter"
                            }, deepCopy(destination, {
                                uuid: $(this).attr("data-sign") + "destination"
                            })); //终点  
                        }

                        instance.draggable(this, {
                            containment: "parent"
                        });
                    });
                    //固定连线
                    for(var i = 0; i < data.extra.connects.length; i++) {
                        instance.connect({
                            uuids: [data.extra.connects[i].originIndex + "origin", data.extra.connects[i].destinationIndex + "destination"]

                        });
                    };
                }
            }
        });
    }

    //jqueryUI拖拽设置
    $("#flowbtn .item").draggable({
        helper: "clone",
        scope: "plant"
    });
    $("#container").droppable({
        scope: "plant",
        drop: function(event, ui) {
            console.log(ui)
            CreateModel(ui, $(this));
        }
    });

    //  data-sign:节点索引
    //  data-index:节点类型
    function CreateModel(ui, selector) {
        var item = $(ui.draggable[0]).text();
        var menuid = $(ui.draggable[0]).attr("id");
        var id = "node_" + menuid + "_" + nodeCounter++;
        var html = '<div id=' + id + ' class="item" data-sign="' + nodeCounter + '" data-index="' + $(ui.draggable[0]).attr("data-index") + '">' + item + '</div>';
        $(selector).append(html);

        var left = parseInt(ui.offset.left - $(selector).offset().left);
        var top = parseInt(ui.offset.top - $(selector).offset().top);
        $("#" + id).css({
            "left": left,
            "top": top,
            position: "absolute",
            "z-index": 100
        });
        //添加连接点
        instance.addEndpoint(id, {}, origin);
        instance.addEndpoint(id, {}, destination);

        //注册实体可draggable,并且将端点限制在父级内
        $("#" + id).draggable({
            containment: "parent",
            drag: function(event, ui) {
                instance.repaintEverything();
            },
            stop: function() {
                instance.repaintEverything();
            }
        });

        var obj = {
            offset: {
                top: top,
                left: left
            },
            name: item,
            type: $(ui.draggable[0]).attr("data-index"),
            index: nodeCounter,
        }
        mainArr.push(obj);
        console.log("mainArr", mainArr)
    }

    self.init()
})