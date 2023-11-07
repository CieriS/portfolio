####Links Table
```sql
PATH=/Applications/XAMPP/xamppfiles/bin:$PATH

mysql -h localhost -u root

USE my_cierisamuele;

CREATE TABLE linkOwner (
    id INT AUTO_INCREMENT NOT NULL,
    name VARCHAR(20) NOT NULL,
    middleName VARCHAR(20) DEFAULT NULL,
    surname VARCHAR(20) NOT NULL,
    PRIMARY KEY(id)
);

INSERT INTO linkOwner 
VALUES 
(4, 'Samuele', DEFAULT, 'Cieri');

CREATE TABLE commonLinks(
    hReference VARCHAR(20) NOT NULL,
    owner INT DEFAULT NULL,
    hUrl VARCHAR(50) NOT NULL,
    description VARCHAR(50) DEFAULT NULL,
    PRIMARY KEY(hReference),
    FOREIGN KEY(owner) REFERENCES linkOwner(id) ON UPDATE CASCADE ON DELETE CASCADE
);

INSERT INTO commonLinks 
VALUES 
('myAltervistaSiteUrl', 4, 'https://cierisamuele.altervista.org/', 'Portfolio home page'),
('instagram', 4, 'https://www.instagram.com/samuelecierii/', 'instagram account'),
('linkedIn', 4, 'https://www.linkedin.com/in/samuelecieri/', 'linkedIn account'),
('payPal', 4, 'https://paypal.me/CieriS/', 'paypal account'),
('telegram', 4, 'https://t.me/sCieri/', 'telegram account'),
('github', 4, 'https://github.com/CieriS/', 'Github profile'),
('gitLab', 4, 'https://gitlab.com/CieriS/', 'GitLab account');
('', 4, '', ''),

SELECT * 
FROM commonLinks 
WHERE owner = 4 
ORDER BY RAND();
```


/* database: my_cierisamuele */

CREATE TABLE ptf_projectCards(

    idCard INT AUTO_INCREMENT NOT NULL,
    imgLinkCard VARCHAR(50) NOT NULL,
    descriptionCard BLOB NOT NULL,
    linkToRepo VARCHAR(50) NOT NULL,
    insertProjectDate DATE NOT NULL,
    lastUpdateProjectDate DATE,
    PRIMARY KEY('idCard')

);

CREATE TABLE ptf_navbar(
    
);

CREATE TABLE ptf_aboutMe(
    idAboutMe INT AUTO_INCREMENT NOT NULL,
    whoIAm
    myVision
    myImg
    updateDatetime Date NOT NULL,
    PRIMARY KEY('idAboutMe')
);

CREATE TABLE ptf_skills(
    skills ,
    progressBar
);

CREATE TABLE ptf_social(
    isHidden
);