var express 	= require("express");
var http 		= require("http");
const multer = require('multer');
var bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
var app 		= express();
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const QRCode = require('qrcode');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
	//app.use(cors());
	next();
});

var server = http.createServer(app).listen(1458, function(){
  console.log("Webhook listening on port " + 1458);
});


app.post('/gerar-carteira', upload.single('foto'), (req, res) => {

	const {
		nome,
		cpf,
		matricula,
		data_nascimento,
		curso,
		data_inicio,
		validade,
		hash_carteirinha,
		link_carteirinha,
		senha_carteirinha
	} = req.body;
	console.log(
		nome,
		cpf,
		matricula,
		data_nascimento,
		curso,
		data_inicio,
		validade,
		hash_carteirinha,
		link_carteirinha,
		senha_carteirinha
	)
  	const fotoBuffer = fs.readFileSync(req.file.path);

	//Primeiro vamos gerar o QRcode
	console.log('gerando QRCode');

	var qrcode_filepath = __dirname+"/app/qrcodes/"+cpf+".jpg";

	QRCode.toFile(qrcode_filepath, link_carteirinha, {
		errorCorrectionLevel: 'H'
	  }, function(err) {
		if (err) throw err;
		console.log(err)
		console.log('QR code saved!');
	  });

	var qrCodeBuffer= fs.readFileSync(qrcode_filepath);

	const doc = new PDFDocument({
	size: [36 * 28.35, 18 * 28.35], // largura x altura em pontos
	});

	doc.rect(0, 0, doc.page.width, doc.page.height).fill('black');

	doc.image(__dirname+"/app/res/card-front.png", {
		fit: [doc.page.width, doc.page.height],
	}, 0,0);

  	doc.image(qrCodeBuffer, 700, 280, {width: 180, height: 180});

	doc.image(fotoBuffer, 145, 206, {width: 180, height: 180});

	doc.fontSize(22).fillAndStroke('white', '#900').text(nome, 145, 160);

	//informações ao lado da foto
	var yIni = 176;
	var ySpace = 30;
	var position = 1;
	var xCol1 = 350;
	var xCol2 = 500;

	//Col1
	doc.fontSize(20).fillColor('white').text(curso, xCol1, yIni + (ySpace * position++));
	doc.fontSize(20).fillColor('gray').text('Matrícula:', xCol1, yIni + (ySpace * position++));
	doc.fontSize(20).fillColor('gray').text('CPF:', xCol1, yIni + (ySpace * position++));
	doc.fontSize(20).fillColor('gray').text('Data de Nasc.:', xCol1, yIni + (ySpace * position++));
	doc.fontSize(20).fillColor('gray').text('Início do Curso:', xCol1, yIni + (ySpace * position++));
	doc.fontSize(20).fillColor('gray').text('Validade: ', xCol1, yIni + (ySpace * position++));

	//Col 2
	position = 2;
	doc.fontSize(20).fillColor('white').text(matricula, xCol2, yIni + (ySpace * position++));
	doc.fontSize(20).fillColor('white').text(cpf, xCol2, yIni + (ySpace * position++));
	doc.fontSize(20).fillColor('white').text(data_nascimento, xCol2, yIni + (ySpace * position++));
	doc.fontSize(20).fillColor('white').text(data_inicio, xCol2, yIni + (ySpace * position++));
	doc.fontSize(20).fillColor('white').text(validade, xCol2, yIni + (ySpace * position++));

	doc.addPage();
	doc.rect(0, 0, doc.page.width, doc.page.height).fill('black');
	doc.image(__dirname+"/app/res/card-back.png", {
		fit: [doc.page.width, doc.page.height],
	}, 0,0);

	//const anoAtual = new Date().getFullYear();
	//doc.fontSize(18).fillColor('black').text(`Ano atual: ${anoAtual}`, 100, 50);
	doc.fontSize(18).fillColor('white').text("Senha de Validação: " + senha_carteirinha, 150, 410);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=contato.pdf');

  doc.pipe(res);
  doc.pipe(fs.createWriteStream(__dirname+'/app/generated/'+matricula+'.pdf'));
  doc.end();


fs.unlink(req.file.path, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Arquivo apagado com sucesso!');
});

});


// app.get('/contact', function (req, res, body) {
// 	try{
// 		console.log("contato");
// 		res.sendFile(__dirname+"/app/form_contact.html");
// 	}catch(err){
// 	}
// })
//
// app.get('/gerar', function (req, res, body) {
// 	try{
// 		console.log("gerar");
// 		res.sendFile(__dirname+"/app/contact_data.html");
// 	}catch(err){
// 	}
// })
//
// app.get('/photo', function (req, res, body) {
// 	try{
// 		console.log("gerar");
// 		res.sendFile(__dirname+"/app/submit_photo.html");
// 	}catch(err){
// 	}
// })
//
//
// app.get('/*', function (req, res){res.status(404).send()});
// app.post('/*', function (req, res){res.status(404).send()});