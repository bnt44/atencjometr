# Wykop atencjometr
Generowanie statystyki na podstawie wpisów by @[MirkoStats](http://www.wykop.pl/ludzie/MirkoStats/)

##Generowanie kluczy Wykop API
Ze wzgldu na limity zapytań do API wykopu każdy musi wygenerować swój klucz api (tylko raz) 
* Przechodzimy do http://www.wykop.pl/dla-programistow/nowa-aplikacja/
* Wpisujemy nazwe aplikacji (dowolna), zaznaczamy regulamin i captche
* "Generuj klucz api" - zapisujemy klucze, gotowe

![img](https://raw.githubusercontent.com/bnt44/atencjometr/master/images/tworzenie-aplikacji.jpg)

![img](https://raw.githubusercontent.com/bnt44/atencjometr/master/images/klucze.jpg)

##Windows
* Przechodzimy do https://github.com/bnt44/atencjometr/releases
* Pobieramy najnowszą wersję
* Rozpakowujemy i uruchamiamy `Start.bat`

##Linux/Mac
Wymagania: 
* NodeJS min. v4.0.0
* NPM
````
git clone https://github.com/bnt44/atencjometr.git
cd atencjometr
npm install
npm start
````

##Generowanie startstyk
* Uruchamiamy program
* podajemy wymagane informacje: 
  * Klucz api
  * sekret api
  * nick osoby, dla której chcemy wygenerowac statystyki
  * Zakres pobieranych wpisów - **od najnowszych do podanej daty** DD.MM.RRRR np. za cay 2015 rok: `01.01.2015`
  * Minimalna liczba plusów od użytkownika, aby pojawil sie na liscie "top plusujacych"
* Program pobierze wpisy z api i plik ze statystykami zapisze w folderze z programem

![img](https://raw.githubusercontent.com/bnt44/atencjometr/master/images/demo.gif)

##Limity 
API Wykopu ma limity godzinowe zapytań na konto. Pobranie 1 strony z API = jedno zapytanie. 
Jeżeli przekroczyłeś limit musisz poczekac az limit się zresetuje. 
Bierzące użycie limitu można sprawdzic tutaj http://www.wykop.pl/dla-programistow/twoje-aplikacje/

##Brak dostępu do api 
Zielonki i konta ze zbyt małą aktywnością nie mogą wygenerowac kluczy API.
Mogą: 
* napisac do administracji prośbę o utowrzenie aplikacji
* pożyczyc klucze od innej osoby (pamiętajcie o limitach)
