<?php
require('config.inc.php');
echo json_encode(R::findAndExport('users'));