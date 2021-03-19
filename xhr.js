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

const generateToken = (callback) => {
		
	if (window.location.hash) {
		callback(window.location.hash);
	} else {
		window.location.replace('https://www.arcgis.com/sharing/rest/oauth2/authorize?client_id=ASdBUonq0kdFrBGt&display=default&redirect_uri=https://zachary-sutherby.github.io/&parent=https://zachary-sutherby.github.io/&locale=en&response_type=token&expiration=720')
	};
	
};


const estimate = () => {
  var x = document.getElementById("estimate_credits");
  let params = new URLSearchParams(document.location.search.substring(1));
  let oid = parseInt(params.get("objectId"));
  console.log(oid);
  
  let token = generateToken((token)=>{
		console.log('token', token);
		sendHttpRequest('GET', 'https://survey123.arcgis.com/api/featureReport/estimateCredits?featureLayerUrl=https://services5.arcgis.com/jMCHJcLe13FaKCFB/arcgis/rest/services/service_9f1cd3408c3042c8b29300a049a6469a/FeatureServer/0&queryParameters={"where": "objectId='+oid+'"}&templateItemId=d6f2895b4a74492b9fdcab1d3eaa2f1f&token='+token).then(responseData => {
		console.log(responseData['resultInfo'].cost);
		//return responseData['resultInfo'].cost
		document.getElementById("estimate_credits").innerHTML = responseData['resultInfo'].cost;
		//return x.innerHTML = responseData['resultInfo'].cost;
		});
  });
};


const createReport = () => {
	let params = new URLSearchParams(document.location.search.substring(1));
	let oid = parseInt(params.get("objectId"));
	console.log(oid);
	let token = generateToken((token)=>{
		console.log('token', token);
		
		sendHttpRequest('POST', 'https://survey123.arcgis.com/api/featureReport/createReport/submitJob', {
		featureLayerUrl: 'https://services5.arcgis.com/jMCHJcLe13FaKCFB/arcgis/rest/services/service_9f1cd3408c3042c8b29300a049a6469a/FeatureServer/0',
		queryParameters: '{"where":"objectId=' + oid + '","orderByFields":"||EditDate DESC, objectid ASC"}',
		templateItemId: 'd6f2895b4a74492b9fdcab1d3eaa2f1f',
		token: token,
		surveyItemId: '02035e027391421494267c33dcb974e3',
		outputFormat: 'docx'
		})
			.then(responseData => {
			console.log(responseData);
			checkJobStatus(responseData['jobId'], token);
		})
			.catch(err => {
			console.log(err);
		});
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