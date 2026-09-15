<?php

$a = 0;

for( $i = 0; $i < 100; $i++ ){ //stampa le 100 equazioni che disegnano un cuore
    $a += 0.2;
    if( $a < 9.9 ){
        $alfa = sprintf("0%02.1f", $a);
    } else {
        $alfa = sprintf("%02.1f", $a);
    }
    echo "( sin(($alfa&pi;)/10) + x )<sup>2</sup> + ( cos(($alfa&pi;)/10) + y )<sup>2</sup> = 0.7 * y * |x| + 1 <br/>";
}

?>