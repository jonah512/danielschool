import json
from pathlib import Path
from threading import Lock

class Configuration:
    _instance = None  # Singleton instance
    _lock = Lock()  
    CONFIG_FILE_PATH = Path("config.json")
    _config_data = None

    def __new__(cls):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = super(Configuration, cls).__new__(cls)
                    cls._load_configuration()  
        return cls._instance

    @classmethod
    def _load_configuration(cls):
        if cls._config_data is None:
            if cls.CONFIG_FILE_PATH.is_file():
                with open(cls.CONFIG_FILE_PATH, "r") as config_file:
                    cls._config_data = json.load(config_file)
            else:
                cls._config_data = {} 

    def set_configuration(self, config_data: dict):
        try:
            with open(self.CONFIG_FILE_PATH, "w") as config_file:
                json.dump(config_data, config_file, indent=4)
            self._config_data = config_data 
        except Exception as e:
            raise RuntimeError(f"Failed to write configuration: {e}")

    def get_configuration(self) -> dict:
        return self._config_data

    def get(self, key: str):
        return self._config_data.get(key)
