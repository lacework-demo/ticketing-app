pipeline {
  agent { label 'agent' }
  stages {
    stage('deploy ticketing') {
      steps {
        sh 'detc create --plan https://raw.githubusercontent.com/lacework-demo/ticketing-app/main/deploy/ticketing-gcp.yaml --apply --trace'
      }
    }
  }
}

