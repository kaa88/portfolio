<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;
require '../libs/phpmailer/src/PHPMailer.php';
require '../libs/phpmailer/src/Exception.php';
require '../libs/phpmailer/src/SMTP.php';

$mail = new PHPMailer(true);

try {
	//Server settings
	$mail->SMTPDebug = SMTP::DEBUG_SERVER;
	$mail->isSMTP();
	$mail->Host = 'smtp.yandex.ru';
	$mail->SMTPAuth = true;
	$mail->Username = 'troll-sbor';
	$mail->Password = 'pfhwddtrekxvwcwz';
	$mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
	$mail->Port = 465;

	//Mail settings
	$mail->CharSet = 'UTF-8';
	$mail->setLanguage('ru', 'phpmailer/language/');
	$mail->IsHTML(true);

	//Recipients
	$mail->setFrom('troll-sbor@yandex.ru', 'Site subscriber');
	// $mail->addAddress('dre021088@gmail.com');
	$mail->addCC('troll-sbor@yandex.ru');
	// $mail->addBCC('bcc@example.com');
	// $mail->addReplyTo('info@example.com', 'Information');

	//Content
	$subj = 'Subject';
	$body = '<h2>Заголовок письма!!!</h2>';

	if(trim(!empty($_POST['name']))){
		$body.='<p><strong>Имя:</strong> '.$_POST['name'].'</p>';
	}
	if(trim(!empty($_POST['email']))){
		$body.='<p><strong>email:</strong> '.$_POST['email'].'</p>';
	}
	if(trim(!empty($_POST['phone']))){
		$body.='<p><strong>Телефон:</strong> '.$_POST['phone'].'</p>';
	}
	if(trim(!empty($_POST['message']))){
		$body.='<p><strong>Сообщение:</strong> '.$_POST['message'].'</p>';
	}

	//Attachments
	// if (!empty($_FILES['image']['tmp_name'], $filePath)){
	// 	// путь загрузки файла
	// 	$filePath = __DIR__ . '/files/' . $_FILES['image']['name'];
	// 	// грузим файл
	// 	if (copy($_FILES['image']['tmp_name'], $filePath)){
	// 		$fileAttach = $filePath;
	// 		$body.='<p><strong>Фото в приложении</strong>';
	// 		$mail->addAttachment($fileAttach);
	// 	}
	// }
	// $mail->addAttachment('/tmp/image.jpg', 'new.jpg');		//Optional name

	$mail->Subject = $subj;
	$mail->Body = $body;
	$mail->send();
	echo 'Message has been sent';
} catch (Exception $e) {
	echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}
?>