var url = "http://192.168.1.208:8000"; //测试环境
var getuserurl = "http://192.168.1.209" //获取用户登录信息 测试环境

//var url = "http://10.161.120.225:8000"; //生产环境
//var getuserurl = "http://10.161.120.225"


//获取当前年月日
function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if(month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if(strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = year + seperator1 + month + seperator1 + strDate;
    return currentdate;
}

function uuid(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [],
        i;
    radix = radix || chars.length;

    if(len) {
        // Compact form
        for(i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
        // rfc4122, version 4 form
        var r;

        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for(i = 0; i < 36; i++) {
            if(!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }

    return uuid.join('');
}

//获取url里面的字段
function getvalue(name) {
    var str = window.location.search;
    if(str.indexOf(name) != -1) {
        var pos_start = str.indexOf(name) + name.length + 1;
        var pos_end = str.indexOf("&", pos_start);
        if(pos_end >= pos_start) {
            return str.substring(pos_start, pos_end);
        }
        if(pos_end == -1) {
            return str.substring(pos_start);
        } else {
            alert("数据不存在！");
        }
    }
}
//var id=getvalue("id");

var d = new Date();
//var datenow = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
var datenow = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes();

//setInterval(function(){
//  d = new Date();
//  datenow = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate()+" " + d.getHours()+ ":" + d.getMinutes();
//  //console.log("datenow",datenow)
//  listarr[3].value.sys=datenow;
//},60000)

var listarr = [{
        "type": "text",
        "form_layout": "form_layout1",
        "Disp": "在左面",
        "iconClass": "fa fa-pencil fa-fw",
        "enable": false, //只读
        "visible": true,
        "allowBlank": false, //必填
        "noRepeat": false,
        "description": null,
        "value": null, //input value值
        "label": "单行文本"
    }, {

        "type": "textarea",
        "form_layout": "form_layout1",
        "Disp": "在左面",
        "iconClass": "fa fa-file-text-o fa-fw",
        "enable": false,
        "visible": true,
        "allowBlank": false, //必填
        "noRepeat": false,

        "description": null,
        "value": null, //input value值
        "label": "多行文本"
    }, {
        "type": "number",
        "form_layout": "form_layout1",
        "Disp": "在左面",
        "dataType": "int",
        "iconClass": "fa fa-sort-numeric-asc fa-fw",
        "enable": false,
        "visible": true,
        "allowBlank": false, //必填
        "noRepeat": false,
        "description": null,
        "value": null, //input value值
        "label": "数字"
    }, {
        "type": "datetime",
        "form_layout": "form_layout1",
        "Disp": "在左面",
        "formatvalue": "format1",
        "useSystemDate": true, //系统日期
        "iconClass": "fa fa-calendar fa-fw",
        "enable": false,
        "visible": true,
        "allowBlank": false, //必填
        "noRepeat": false,
        "description": null,
        //"value": null,   //input value值
        "value": {
            sys: datenow,
            unsys: null
        },
        "label": "日期时间"
    }, {
        "type": "radiogroup",
        "form_layout": "form_layout1",
        "Disp": "在左面",
        "layout": "horizontal",
        "iconClass": "fa fa-dot-circle-o fa-fw",
        "enable": false,
        "visible": true,
        "allowBlank": false, //必填
        "noRepeat": false,
        "items": [{
                "text": "选项1",
                "value": "选项1"
            },
            {
                "text": "选项2",
                "value": "选项2"
            },
            {
                "text": "选项3",
                "value": "选项3"
            }
        ],
        "description": null,
        "value": null, //input value值
        "label": "单选框"
    }, {
        "type": "checkboxgroup",
        "form_layout": "form_layout1",
        "Disp": "在左面",
        "layout": "horizontal",
        "iconClass": "fa fa-check-square-o fa-fw",
        "enable": false,
        "visible": true,
        "allowBlank": false, //必填
        "noRepeat": false,
        "items": [{
                "text": "选项1",
                "value": "选项1"
            },
            {
                "text": "选项2",
                "value": "选项2"
            },
            {
                "text": "选项3",
                "value": "选项3"
            }
        ],
        "description": null,
        "value": [], //input value值
        "label": "复选框"
    }, {
        "type": "combo",
        "form_layout": "form_layout1",
        "Disp": "在左面",
        "iconClass": "fa fa-toggle-down fa-fw",
        "enable": false,
        "visible": true,
        "allowBlank": false, //必填
        "noRepeat": false,
        "items": [{
                "text": "选项1",
                "value": "选项1"
            },
            {
                "text": "选项2",
                "value": "选项2"
            },
            {
                "text": "选项3",
                "value": "选项3"
            }
        ],
        "description": null,
        "value": null, //selcet value值,既key值
        "label": "下拉框"
    }, {
        "type": "separator",
        "form_layout": "form_layout1",
        "Disp": "在左面",
        "lineWidth": 1,
        "lineType": "solid",
        "color": "#e0e0e0",
        "iconClass": "fa fa-minus fa-fw",
        "enable": false,
        "visible": true,
        "allowBlank": false, //必填
        "noRepeat": false,
        "description": null,
        "label": "分割线"
    }, {
        "type": "describe",
        "Disp": "不显示",
        "bgColor": "#ffffff",
        "color": "#1f2d3d",
        "iconClass": "fa fa-file-text fa-fw",
        "enable": false,
        "visible": true,
        "allowBlank": false, //必填
        "noRepeat": false,
        "description": null,
        "value": null, //input value值
        "label": "描述文字"
    }, {
        "type": "image",
        "form_layout": "form_layout1",
        "Disp": "在左面",
        "filelist": [],
        "allowMulti": true,
        "iconClass": "fa fa-image fa-fw",
        "enable": false,
        "visible": true,
        "allowBlank": false,
        "description": null,
        "label": "图片"
    },
    {
        "type": "file",
        "form_layout": "form_layout1",
        "Disp": "在左面",
        "filelist": [],
        "allowMulti": true,
        "iconClass": "fa fa-upload fa-fw",
        "enable": false,
        "visible": true,
        "allowBlank": false,
        "description": null,
        "label": "附件"
    }
]