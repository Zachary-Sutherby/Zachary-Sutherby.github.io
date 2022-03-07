const estimateBtn = document.getElementById('estimate-btn');
const reportBtn = document.getElementById('report-btn');


const sendHttpRequest = (method, url, data) => {
  const promise = new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    xhr.responseType = 'json';

    if (data) {
      xhr.setRequestHeader('Content-Type', 'application/json');
    }

    xhr.onload = () => {
      if (xhr.status >= 400) {
        reject(xhr.response);
      } else {
        resolve(xhr.response);
      }
    };

    xhr.onerror = () => {
      reject('Something went wrong!');
    };

    xhr.send(JSON.stringify(data));
  });
  return promise;
};

const estimate = () => {
  let params = new URLSearchParams(document.location.search.substring(1));
  let oid = parseInt(params.get("objectId"));
  let token = params.get("token");
  console.log(oid);
  console.log(token);
  
  sendHttpRequest('GET', 'https://survey123.arcgis.com/api/featureReport/estimateCredits?featureLayerUrl=https://services9.arcgis.com/QqYTCcI9gte4fVq0/ArcGIS/rest/services/Water_Stations_editing/FeatureServer/0&queryParameters={"where": "objectId='+oid+'"}&templateItemId=746317007791465291b4a939cfc50638&token='+token).then(responseData => {
	console.log(responseData['resultInfo'].cost);
	//return responseData['resultInfo'].cost
	document.getElementById("estimate_credits").innerHTML = "Estimated credit cost: " + responseData['resultInfo'].cost;
	//return x.innerHTML = responseData['resultInfo'].cost;
	});
  
};


const createReport = () => {
	let params = new URLSearchParams(document.location.search.substring(1));
	let oid = parseInt(params.get("objectId"));
	let token = params.get("token");
	console.log(oid);
	console.log(token);
	sendHttpRequest('POST', 'https://survey123.arcgis.com/api/featureReport/createReport/submitJob', {
	featureLayerUrl: 'https://services9.arcgis.com/QqYTCcI9gte4fVq0/ArcGIS/rest/services/Water_Stations_editing/FeatureServer/0',
	queryParameters: '{"objectIds":"' + oid + '","orderByFields":"||EditDate DESC, objectid ASC"}',
	templateItemId: '746317007791465291b4a939cfc50638',
	token: token,
	surveyItemId: 'e7709174ba48426c880e504e11319970',
	outputFormat: 'pdf'
	})
		.then(responseData => {
		console.log(responseData);
		checkJobStatus(responseData['jobId'], token);
	})
		.catch(err => {
		console.log(err);
	});

  
};

const checkJobStatus = (jobId, token) => {
	sendHttpRequest('GET', 'https://survey123.arcgis.com/api/featureReport/jobs/' + jobId + '?token='+token).then(responseData => {
		console.log(responseData);
		document.getElementById("generate_report").innerHTML = responseData['jobStatus'];
		if (responseData['jobStatus'] == 'esriJobExecuting') {
			document.getElementById("generate_report").innerHTML = responseData['jobStatus'];
			setTimeout(checkJobStatus(responseData['jobId'], token), 10000);			
		} else if (responseData['jobStatus'] == 'esriJobSucceeded') {
			console.log(responseData['resultInfo'].resultFiles[0].url);
			// document.getElementById("generate_report").innerHTML = responseData['resultInfo'].resultFiles[0].url;
			document.getElementById("generate_report").innerHTML = "Download Report Here";
			document.getElementById("generate_report").href = responseData['resultInfo'].resultFiles[0].url;
		}
	});	
};	


estimateBtn.addEventListener('click', estimate);
reportBtn.addEventListener('click', createReport);