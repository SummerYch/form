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
    var businessTaskId = getvalue("businessTaskId");
    //businessTaskId="232510";
    var loglist = [];
    var mainArr = [];
    var connects = [];
    var nodeCounter = 0;
    var processClass = "noprocess";
    var isend = false;

    //初始化一个jsPlumb实例
    var instance = jsPlumb.getInstance();

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

    self.init = function() {
        getend();
        getlog();
        getnode();
    }

    function setStatus(status) {
        switch(status) {
            case "已办":
                {
                    processClass = "processed";
                    break;
                }
            case "待办":
                {
                    processClass = "processing";
                    break;
                }
        }
    }

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

    function getend() {
        $.ajax({
            type: "GET",
            async: false,
            url: url + "/flow/" + businessTaskId + "/flowfinished",
            beforeSend: function(request) {
                request.setRequestHeader('Content-Type', 'application/json');
            },
            data: {},
            dataType: "json",
            error: function() {

            },
            success: function(data) {
                console.log("isend", data);
                if(data.extra == 1) {
                    isend = true;
                }
            }
        });

    }

    function getnode() {
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

            },
            success: function(data) {
                console.log(data);
                if(data.error_code == 1000 && data.extra && data.extra.mainArr) {
                    var nodedata = data.extra;
                    mainArr = nodedata.mainArr;
                    connects = nodedata.connects;
                    var mainHTML = '';
                    for(var i = 0; i < mainArr.length; i++) {
                        if(loglist.length > 0) {
                            for(var j = 0; j < loglist.length; j++) {
                                if(mainArr[i].name == loglist[j].task_name) {
                                    setStatus(loglist[j].status);
                                    break;
                                } else {
                                    processClass = "noprocess";
                                }
                            }
                        }
                        if(i == 0) {
                            processClass = "processed";
                        }
                        if(isend && i == mainArr.length - 1) {
                            processClass = "processed";
                        }
                        console.log("processClass", processClass)
                        mainHTML += '<div class="item ' + processClass + '" data-sign="' + mainArr[i].index + '"  data-index="' + mainArr[i].type + '" style="left:' + mainArr[i].offset.left + 'px;top:' + (mainArr[i].offset.top + 50) + 'px;position:absolute;margin:0" >' + mainArr[i].name + '</div>';
                    };

                    $("#main").append(mainHTML);

                    $("#main .item").each(function() {
                        jsPlumb.addEndpoint(this, {
                            anchors: "BottomCenter"
                        }, deepCopy(origin, {
                            uuid: $(this).attr("data-sign") + "origin"
                        })); //起点
                        if($(this).attr("data-sign") > 0) { //开始节点不设接入端点
                            jsPlumb.addEndpoint(this, {
                                anchors: "TopCenter"
                            }, deepCopy(destination, {
                                uuid: $(this).attr("data-sign") + "destination"
                            })); //终点  
                        }

                        jsPlumb.draggable(this, {
                            containment: "parent"
                        });
                    });
                    //固定连线
                    for(var i = 0; i < connects.length; i++) {
                        jsPlumb.connect({
                            uuids: [connects[i].originIndex + "origin", connects[i].destinationIndex + "destination"]

                        });
                    };
                }
            }
        });
    }

    function getlog() {
        $.ajax({
            type: "GET",
            async: false,
            url: url + "/flow/" + businessTaskId + "/history",
            beforeSend: function(request) {
                request.setRequestHeader('Content-Type', 'application/json');
            },
            data: {},
            dataType: "json",
            error: function() {

            },
            success: function(data) {
                console.log("loglist", data);
                loglist = data.data;
                var html = template('log', {
                    list: loglist
                })
                $("#logtable").append(html);
            }
        });
    }

    $(".headbtn").on("click", function() {
        $(".wrap").show(1);
        $(".wrap-cont").delay(1000).addClass("hot");
    });
    $(".wrap-close").on("click", function() {
        $(".wrap").delay(400).hide(1)
        $(".wrap-cont").removeClass("hot");
    });
    self.init();
})