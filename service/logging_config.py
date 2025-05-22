# Copyright (c) 2025 Milal Daniel Korean School.

import logging.config

LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '%(asctime)s-%(name)s-%(levelname)s- %(message)s',
        },
    },
    'handlers': {
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'service.log',
            'formatter': 'standard',
            'level': 'DEBUG',
        },
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'standard',
            'level': 'INFO',
        },
    },
    'loggers': {
        '': {  # root logger
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}

def setup_logging():
    logging.config.dictConfig(LOGGING_CONFIG)
