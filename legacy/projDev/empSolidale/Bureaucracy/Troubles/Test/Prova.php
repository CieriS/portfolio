<!doctype html>
<html lang="it" ondragstart='return false' onselectstart='return false'>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="FileInclude/OldStyle.css" media="" rel="stylesheet" type="text/css">
<title> SamueleCieri - Home </title>
<script src="FileInclude/JavaScript.js"></script>
</script>
</head>
<body>

    <?php
    
        require('FileInclude/FileRequired/Connessione.php');
        require('FileInclude/FileRequired/NavBars.php');

        if($_REQUEST)
            {
            
                

            }
            else
            {

                $action=$_SERVER['PHP_SELF'];
                echo "<form action=" . $action . " method='POST' autocomplete='Off'>";
                ?>

                <table border="8">

                    <tr>

                        <th colspan="2">Titolo</th>

                    </tr>

                    <tr>

                        <th>Titolo</th><th>Titolo</th>

                    </tr>

                    <tr>

                        <th>Titolo</th><th>Titolo</th>

                    </tr>

                    <tr>

                        <th>Titolo</th><th>Titolo</th>

                    </tr>

                    <tr>

                        <th>Titolo</th><th>Titolo</th>

                    </tr>

                    <tr>

                        <th colspan="2"><input type="text" /></th>

                    </tr>

                </table>
                </form>
                <?php

            }

    ?>

    <Div Class="Description">

        <Div Class="">

            What is Lorem Ipsum?

                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                Why do we use it?

        </Div>

    </Div>

</body>
</html>