var baseUrl = url;
var userUrl = getuserurl;
var entryId = getvalue("entryId");
var dataId = getvalue("dataId");
var businessTaskId = getvalue("businessTaskId");
// var entryId = "0581c6eea3578b6d41d8afa38eabc65e";
// var dataId = 'a9e54312ef524e2ebc6d1a67db19bd1c';

var myform = new Vue({
    el: '#view',
    data: {
        form_layout: null,
        iframesrc: null,
        forname: null,
        startTime: null,
        dept: null,
        applicant: null,
        user: null,
        imglist: [],
        fileList: [],
        baseUrl: baseUrl,
        formname: null,
        list: [],
        entryId: entryId,
        dataId: dataId,
        businessTaskId: businessTaskId
    },
    created: function() {

        console.log("entryId:", this.entryId)
        console.log("dataId:", this.dataId)

        if(!this.dataId) {
            this.dataId = 0;
        }

        // 获取数据
        Vue.http.get(baseUrl + '/data/read/' + this.entryId + '/' + this.dataId).then(response => {
            console.log(response.body)
            if(response.body.error_code == 1000) {
                this.applicant = response.body.extra.applicant;
                this.startTime = response.body.extra.startTime;
                this.dept = response.body.extra.dept;
                this.forname = response.body.extra.formName;

                if(response.body.extra.form) {
                    this.form_layout = response.body.extra.form.form_layout;
                    var templist = response.body.extra.form.items;

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

                                if(itemdata) {
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
                                imagesarr = tempfilelist;
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
                                if(listitem.useSystemDate) {
                                    listitem.value = listitem.value.sys;
                                } else {
                                    listitem.value = listitem.value.unsys;
                                }
                            } else {
                                listitem.value = '';
                            }
                        });
                    }

                    this.list = templist;
                }
            }
        }, response => {
            // error callback
        });

    },
    methods: {
        flowstate: function() {
            console.log("entryId", this.entryId);
            console.log("businessTaskId", this.businessTaskId);
            this.iframesrc = "flowstate.html?entryId=" + this.entryId + "&businessTaskId=" + this.businessTaskId;
        }
    }
})

var parseThumbnailElements = function() {
    var items = [];
    for(var i = 0; i < imagesarr.length; i++) {
        var item = imagesarr[i];

        var imgs = new Image();
        imgs.src = item.url;
        var w = imgs.width;
        var h = imgs.height;

        var obj = {};
        obj.src = item.url
        obj.w = w;
        obj.h = h;
        items.push(obj);
    }
    return items;
}

function photoswipe() {
    var pswpElement = document.querySelectorAll('.pswp')[0];

    //此处有坑，只有大图才能出现放大镜图标
    var itemsarr = parseThumbnailElements();

    var options = {
        shareEl: false,
        index: 0 // start at first slide
    };

    // Initializes and opens PhotoSwipe
    var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, itemsarr, options);
    gallery.init();

}

var imagesarr = [];
$("#view").on("click", ".el-upload-list__item-thumbnail", function() {
    //console.log("imagesarr", imagesarr)
    if(imagesarr.length == 0) {
        return;
    }

    photoswipe();
})