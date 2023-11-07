```sql
PATH=/Applications/XAMPP/xamppfiles/bin:$PATH

mysql -h localhost -u root

USE my_cierisamuele;

--la tabella contenente tutte le lingue
CREATE TABLE lang(
    id INT AUTO_INCREMENT PRIMARY KEY,
    language VARCHAR(10) NOT NULL
);

--la tabella contenente tutte le scritte di copywriting presenti nella pagina prinicipale
CREATE TABLE writings(
    id INT AUTO_INCREMENT NOT NULL,
    language INT NOT NULL,
    description VARCHAR(150) NOT NULL,
    PRIMARY KEY(id, language),
    FOREIGN KEY (language) REFERENCES lang(id) ON UPDATE CASCADE ON DELETE CASCADE
);

INSERT INTO lang 
VALUES 
(01, "italiano"),
(02, "english");

INSERT INTO writings 
VALUES 
(01, 1, "Nella quiete del mio eremo, scintillo con intensità quando richiesto."),
(02, 1, "In un mondo fatto di silenzi come il mio, so come farlo risuonare di applausi."),
(03, 1, "Sono l'enigma in persona, l'eremita che non passa inosservato."),
(04, 1, "Silenzio e riflessione sono miei compagni, ma so come catturare gli sguardi."),
(05, 1, "Un eremita affamato di attenzione quando decide di mostrarsi."),
(01, 2, "A quiet soul, but not immune to the allure of the spotlight."),
(02, 2, "Whispering desires while making a statement."),
(03, 2, "From hermit to the heart of the action."),
(04, 2, "A paradox of craving attention and cherishing seclusion."),
(05, 2, "Embracing the spotlight with the wisdom of solitude."),
(06, 2, "Magnetized to the center, yet drawn to solitude."),
(07, 2, "A recluse with a secret desire for the spotlight."),
(08, 2, "Balancing a love for attention with a solitary heart."),
(09, 2, "An introvert who thrives in the limelight."),
(10, 2, "Craving the spotlight from the shadows.");

SELECT W.id AS id, L.language AS language, W.description AS description 
FROM writings AS W INNER JOIN lang as L 
ON W.language = L.id 
WHERE LOWER(L.language) LIKE "english" 
ORDER BY RAND();


INSERT INTO writings 
VALUES 
(01, 0, ''),
(02, 0, ''),
(03, 0, ''),
(04, 0, ''),
(05, 0, ''),
(06, 0, ''),
(07, 0, ''),
(08, 0, ''),
(09, 0, ''),
(10, 0, ''),
(11, 0, ''),
(12, 0, ''),
(13, 0, ''),
(14, 0, ''),
(15, 0, ''),
(16, 0, ''),
(17, 0, ''),
(18, 0, ''),
(19, 0, ''),
(20, 0, ''),
(21, 0, ''),
(22, 0, ''),
(23, 0, ''),
(24, 0, ''),
(25, 0, ''),
(26, 0, ''),
(27, 0, ''),
(28, 0, ''),
(29, 0, ''),
(30, 0, ''),
(31, 0, ''),
(32, 0, ''),
(33, 0, ''),
(34, 0, ''),
(35, 0, ''),
(36, 0, ''),
(37, 0, ''),
(38, 0, ''),
(39, 0, ''),
(40, 0, ''),
(41, 0, ''),
(42, 0, ''),
(43, 0, ''),
(44, 0, ''),
(01, 1, ''),
(02, 1, ''),
(03, 1, ''),
(04, 1, ''),
(05, 1, ''),
(06, 1, ''),
(07, 1, ''),
(08, 1, ''),
(09, 1, ''),
(10, 1, ''),
(11, 1, ''),
(12, 1, ''),
(13, 1, ''),
(14, 1, ''),
(15, 1, ''),
(16, 1, ''),
(17, 1, ''),
(18, 1, ''),
(19, 1, ''),
(20, 1, ''),
(21, 1, ''),
(22, 1, ''),
(23, 1, ''),
(24, 1, ''),
(25, 1, ''),
(26, 1, ''),
(27, 1, ''),
(28, 1, ''),
(29, 1, ''),
(30, 1, ''),
(31, 1, ''),
(32, 1, ''),
(33, 1, ''),
(34, 1, ''),
(35, 1, ''),
(36, 1, ''),
(37, 1, ''),
(38, 1, ''),
(39, 1, ''),
(40, 1, ''),
(41, 1, ''),
(42, 1, ''),
(43, 1, ''),
(44, 1, '');

```