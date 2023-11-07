<?php

function printInConsoleArrayOfObjects($string="", $objs){
    ?>
    <script>
        //salvo in una variabile js const il json $contacts da php
        //lo stampo nei log
        const tableObjsCollected = <?php echo json_encode($objs); ?>;
        const stringToWriteOnConsole = <?php echo json_encode($string); ?>;
        console.log("%c" + stringToWriteOnConsole + ": ", "font-size: 12px; font-style: italic; color: #787276;");
        console.table(tableObjsCollected);
    </script>
    <?php
}

?>