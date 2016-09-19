/**
 * Created by pavilion on 2016/9/17.
 */
var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var id = 224;
var url = "http://dianxin.xupt.edu.cn/index.php/Index/Lv3_Detail/lv3ID/224";
function fetchPage(x){
    startRequest(x);
}
function startRequest(x) {
    http.get(x, function (res) {
        var html = '';
        var titles = [];
        res.setEncoding('utf-8');
        res.on('data', function (chunk) {
            html += chunk;
        })
        res.on('end', function () {
            var $ = cheerio.load(html);
            var time = $('table div:nth-child(1)').next().text().trim();
            var news_item = {
                title: $('table div:nth-child(1)').text().trim(),
                Time: time,
                link: "http://dianxin.xupt.edu.cn/index.php/Index/Lv3_Detail/lv3ID/" + id,
                id: id + 1
            };
            console.log(news_item);
            var news_title = $('table div:nth-child(1)').text().trim();
            savedContent($, news_title);
            savedImg($, news_title);
            //    下一篇文章的标题
            var nextLink = 'http://dianxin.xupt.edu.cn/index.php/Index/Lv3_Detail/lv3ID/' + id;
            id++;
            var str = encodeURI(nextLink);
            if (id - 224 <=200) {
                fetchPage(str);
            }
        });
    }).on('error',function(err){
        console.log(err);
    });
}
//该函数的作用：在本地存储所爬取的新闻内容资源
function savedContent($,news_title){
    $('.r_content').each(function(index,item) {
        var x = $(this).text;
        var y = x.substring(0, 2).trim();
        if (y == '') {
            x += '\n';
            //将新闻文本内容一段一段添加到/data文件夹下，并用新闻的标题来命名文件
            fs.appendFile('./data/' + news_title + '.txt', 'utf-8', function (err) {
                if (err) {
                    console.log(err);
                }
            }).on('error',function(err){
                console.log(err);
            });
        }
    });

}
//该函数的作用：在本地存储所爬取到的图片资源
function savedImg($,news_title){
    $('div img').each(function(index,item){
        var img_title = $(this).parent().next().text().trim();  //获取图片的标题
        if(img_title.length>35||img_title==""){
            img_title="Null";}
        var img_filename = img_title + '.jpg';
        var img_src = 'http://dianxin.xupt.edu.cn' + $(this).attr('src'); //获取图片的url
        //采用request模块，向服务器发起一次请求，获取图片资源
        request.head(img_src,function(err,res,body){
            if(err){
                console.log(err);
            }
        }).on('error',function(error){
            console.log(error);
        });
        //request(img_src).pipe(fs.createWriteStream('./image/'+news_title + '---' + "bmbk"));     //通过流的方式，把图片写到本地/image目录下，并用新闻的标题和图片的标题作为图片的名称。
    })

}
fetchPage(url);