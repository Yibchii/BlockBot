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

# 1. Running The Web Server
## 1.1. Create and enter a Python virtual enviornment.
If you are running Ubuntu:

>Open the root directory of the project, then type in your terminal:
>```
>python -m venv venv
>source venv/bin/activate
>```

If you are on Windows:
> Open the root directory of the project, then type in your terminal:
>```
>python -m venv venv
>.\venv\Scripts\activate
>```

You should now see (venv) at the start of your current line in the terminal.

## 1.2. Start the server(s)
To run the Django and Vite servers, use the following script:
```
python run-server.py
```

>This script launches both Django and Vite and automatically handles entering dev/prod mode based on the current DEBUG setting in the Django settings.py file (prod will need some additional setup at some point, so stick to dev for now).

If you need to run the services manually instead, follow these instructions:

>For development (DEBUG=True):
>- In one terminal, run `python manage.py runserver` to start Django.
>- In another terminal, navigate to /config/frontend/ and run `npm run dev` to start Vite.
>
>For production (DEBUG=False):
>- In one terminal, navigate to /config/frontend run `npm run build` to build the frontend assets.
>- In another terminal, run `python manage.py runserver` to start Django.

You should now have both Django and Vite running and are ready to connect to the server.

## 1.3 Connecting to the server
Use your web browser to navigate to http://127.0.0.1:8000. The page should display and any changes you make should automatically be shown upon saving if you are running in development mode.

# Troubleshooting
## Migration Warnings
When starting the server, if you get a migrations warning or have changed any database models, run the following commands:
```
python manage.py makemigrations
python manage.py migrate
```
To apply migrations for direct userbase/databse control:  
>Navigate in your browser to `localhost:8000/admin`
>a superuser account has been created for developement purposes. Sign in as the superuser using:
>```
>username: admin
>password: password
>```
