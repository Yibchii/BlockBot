# Overview
This program runs on:
```
Python 3.14.4
Django 5.2
```
see requirements.txt for exact version information, and install requirements with
```
pip install -r requirements.txt
```

# Running The Web Server
Create and work within a local python virtual enviornment.
for Ubunutu, do this via

```
python -m venv venv
source venv/bin/activate
```
do NOT include your local /venv/ folder in the repository.

to run the django server, navigate into /config/ and run
```
python manage.py runserver
```
then using your browser navigate to `localhost:8000`


# Using Django
When starting the server, if you get a migrations warning or have changed any database models, run the following commands
```
python manage.py makemigrations
python manage.py migrate
```
to apply migrations


for direct userbase/databse control, navigate in your browser to `localhost:8000/admin`
a superuser account has been created for developement purposes. Sign in as the superuser using 
```
username: admin
password: password
```

