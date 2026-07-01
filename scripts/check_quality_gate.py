import os
import sys
import requests
import time

def get_config():
    """Obtiene y valida la configuración desde variables de entorno."""
    config = {
        'url': os.environ.get('SONAR_HOST_URL'),
        'token': os.environ.get('SONAR_TOKEN'),
        'project': os.environ.get('SONAR_PROJECT_KEY')
    }
    
    if not all(config.values()):
        print("❌ Error: Faltan variables de entorno (SONAR_HOST_URL, SONAR_TOKEN, SONAR_PROJECT_KEY)")
        sys.exit(1)
        
    return config

def fetch_sonar_status(config):
    """Realiza la petición a la API de SonarQube."""
    api_url = f"{config['url'].rstrip('/')}/api/qualitygates/project_status"
    params = {'projectKey': config['project']}
    auth = (config['token'], '')
    
    response = requests.get(api_url, params=params, auth=auth, timeout=10)
    response.raise_for_status()
    return response.json().get('projectStatus', {})

def report_failed_conditions(conditions):
    """Imprime detalles de las condiciones del Quality Gate que fallaron."""
    for cond in conditions:
        if cond.get('status') == 'OK':
            continue
            
        metric = cond.get('metricKey')
        actual = cond.get('actualValue')
        threshold = cond.get('errorThreshold')
        print(f"   - {metric}: Actual {actual} (Umbral Error: {threshold})")

def process_status(project_status):
    """Analiza el estado del proyecto y decide si el pipeline continúa."""
    status = project_status.get('status')
    
    if status == 'OK':
        print("✅ Quality Gate PASSED!")
        return True
        
    if status == 'WARN':
        print("⚠️ Quality Gate WARNING (Revisar en SonarQube)")
        return True

    print(f"❌ Quality Gate FAILED! Status: {status}")
    report_failed_conditions(project_status.get('conditions', []))
    return False

def main():
    config = get_config()
    print(f"🔍 Consultando Quality Gate para: {config['project']}...")
    
    for attempt in range(3):
        try:
            project_status = fetch_sonar_status(config)
            if process_status(project_status):
                sys.exit(0)
            sys.exit(1)
            
        except requests.exceptions.RequestException as e:
            print(f"⚠️ Intento {attempt + 1}/3 fallido: {e}")
            if attempt < 2:
                time.sleep(5)
                
    print("❌ Error de conexión persistente con SonarQube.")
    sys.exit(1)

if __name__ == "__main__":
    main()
