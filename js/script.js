document.addEventListener("DOMContentLoaded", () => {

// Grab form element from page
const form = document.querySelector("#postcode")
const message = document.querySelector("#message")
const error = document.querySelector("#error")
const loading = document.querySelector("#loading")

function ShowMPInfo() {
  let result = document.getElementById("mpInfoBox");
  document.getElementById('graphicButton').style="display:block";
  result.style.display = "block";
  document.getElementById('mpInfoBox').scrollIntoView({behavior: "smooth", block: "end", inline: "center"});
  loading.style.display = "none";
}

function imageSrcToBase64(img) {
  const isBase64 = /^data:image\/(png|jpeg);base64,/.test(img.src);
  if (isBase64) {
    return;
  }
  return fetch(img)
    .then((res) => res.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = reject;
          reader.onload = () => {
            resolve(reader.result);
          };
          reader.readAsDataURL(blob);
        })
    )
    .then((dataURL) => {
      img.src = dataURL;
    });
}

function generateGraphic() {

  html2canvas(document.querySelector("#mpInfoBox"), {
    useCORS:true,
    proxy: 'https://mpreportcard.github.io/report-card',
    windowWidth: mpInfoBox.width,
    width: mpInfoBox.width,
    windowHeight: mpInfoBox.height,
    height: mpInfoBox.height,

  }).then(canvas => {
      canvas.id = "graphic";
      document.getElementById('graphicOutput').appendChild(canvas);
      document.getElementById('graphic').style="display:none";
      document.getElementById('graphicButton').style="display:none";
      imgPreview = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      download_image();
  });

}

function download_image() {
  let download = document.getElementById("graphic");
  image = download.toDataURL("image/png").replace("image/png", "image/octet-stream");
  let link = document.createElement('a');
  link.download = "graphic.png";
  link.href = image;
  link.click();
}

let issuesFor = ['Voted to allow private companies dumping sewage in rivers', 'Voted to keep the Universal Credit uplift for low earners', 'Voted to allow MPs to keep dodgy second jobs', 'Voted for a tax hike on the lowest earners to fund social care', 'Voted to keep free school meals']
let issuesAgainst = ['Voted to ban private companies from dumping sewage in our rivers', 'Voted against keeping the Universal Credit uplift for low earners', 'Voted to ban second jobs for MPs', 'Voted to support social care AND the low paid', 'Voted against free school meals']
let issuesNeutralLab = ['Was not present for the vote on sewage dumping in rivers', 'Was not present for the vote on keeping the Universal Credit uplift for low earners', 'Was not present for the vote on MPs having second jobs', 'Was not present for the vote on tax hikes to fund social care', 'Was not present to vote on keeping free school meals']
let issuesNeutralCon = ['Did not vote against sewage dumping in rivers', 'Did not vote to keep the Universal Credit uplift for low earners', 'Did not vote against MPs having dodgy second jobs', 'Did not vote against tax hikes to fund social care', 'Did not vote to keep funding free school meals']
let forImage = ['/img/F.png', '/img/A.png', '/img/F.png', '/img/F.png', '/img/A.png'];
let againstImage = ['/img/A.png', '/img/F.png', '/img/A.png', '/img/A.png', '/img/F.png'];
let voteCodes = [1116, 1099, 1124, 1147, 940]

let constituency
let constituencyString
let mpFirstName
let mpLastName
let mpFirstNameRaw
let mpLastNameRaw
let vote
let voteString
let accused
let party
let partyString
let note
let mpPhoto
let mpID

form.addEventListener("submit", e => {
  // Stop page refreshing
  e.preventDefault()
  // Make form data accessible as JS variable
  let formData = new FormData(form)
  let postcode = formData.get("postcode")

  function printMessageToScreen(constituencyString){
  fetch(`https://mpreportcard.github.io/report-card/js/constituencies.json`)
      .then(res => res.json())
      .then(data => {
      if(constituencyString == undefined) {
        error.style.display = "block";
        error.innerHTML = "Sorry, looks like that's an invalid postcode."
      } else if (constituencyString == "Southend West" || constituencyString == "North Shropshire") {
        error.style.display = "block";
        error.innerHTML = `Your constituency, ${constituencyString}, does not currently have an MP until an upcoming by-election.`;
      } else {
        loading.style.display = "block";
        error.style.display = "none"
        mpFirstNameRaw = data[constituencyString].Firstname
        mpFirstName = mpFirstNameRaw.toString()
        mpLastNameRaw = data[constituencyString].Lastname
        mpLastName = mpLastNameRaw.toString()
        mpFullName = mpFirstName + " " + mpLastName
        accused = data[constituencyString].Accused
        noteRaw = data[constituencyString].Note
        note = noteRaw.toString();

      fetch(`https://members-api.parliament.uk/api/Members/Search?Name=${mpFirstName}%20${mpLastName}&skip=0&take=20`)
          .then(res => res.json())
          .then(parlData => {
            //console.log(parlData)

            mpPhoto = parlData.items[0].value.thumbnailUrl;
            imageSrcToBase64(mpPhoto);
            party = parlData.items[0].value.latestParty.name;
            mpID = parlData.items[0].value.id;
            console.log(mpID);

            document.getElementById('mpPhoto').src = `${mpPhoto}`

            switch (party) {
                case "Labour (Co-op)":
                  partyString = "Labour and Co-operative";
                  break;
                default:
                  partyString = party;
            }

            mpNameBullet.innerHTML = `${mpFirstName} ${mpLastName}`;
            partyBullet.innerHTML = `${partyString}`;
            constituencyBullet.innerHTML = `${constituencyString}`;

function checkVote(code) {
  fetch(`https://commonsvotes-api.parliament.uk/data/division/${voteCodes[code]}.json`)
      .then(res => res.json())
      .then(voteData => {

        console.log(voteData);

          let ayesArray = voteData.Ayes;
          let ayeTellersArray = voteData.AyeTellers;
          let noesArray = voteData.Noes;
          let noTellersArray = voteData.NoTellers;

          if (partyString == "Conservative") {
            document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesNeutralCon[code]}: `;
            document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="img/F.png" width = 48px title="Absent or Abstained"/>`;
          } else if (partyString == "Labour") {
            document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesNeutralLab[code]}: `;
            document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="img/absent.png" width = 48px title="Absent or Abstained"/>`;
          } else if (partyString == "Labour and Co-operative") {
            document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesNeutralLab[code]}: `;
            document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="img/absent.png" width = 48px title="Absent or Abstained"/>`;
          } else {
            document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesNeutralLab[code]}: `;
            document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="img/absent.png" width = 48px title="Absent or Abstained"/>`;
          }



          for (let k = 0; k < ayeTellersArray.length; k++) {
            if (ayeTellersArray[k].MemberId === mpID) {
              document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesFor[code]}: `;
              document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="${forImage[code]}" width = 48px title="For"/>`;
              console.log(`voteOutcome${code}: Aye`);
              break;
            }
          }

          for (let l = 0; l < ayesArray.length; l++) {
            if (ayesArray[l].MemberId === mpID) {
              document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesFor[code]}: `;
              document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="${forImage[code]}" width = 48px title="For"/>`;
              console.log(`voteOutcome${code}: Aye`);
              break;
            }
          }

          for (let m = 0; m < noTellersArray.length; m++) {
            if (noTellersArray[m].MemberId === mpID) {
              document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesAgainst[code]}: `;
              document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="${againstImage[code]}" width = 48px title="Against"/>`;
              console.log(`voteOutcome${code}: No`);
              break;
            }
          }

          for (let n = 0; n < noesArray.length; n++) {
            if (noesArray[n].MemberId === mpID) {
              document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesAgainst[code]}: `;
              document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="${againstImage[code]}" width = 48px title="Against"/>`;
              console.log(`voteOutcome${code}: No`);
              break;
            }
          }
  }
  )
}

checkVote(0);
checkVote(1);
checkVote(2);
checkVote(3);
checkVote(4);

let graphicButton = document.getElementById('graphicButton');
graphicButton.addEventListener("click", generateGraphic);

ShowMPInfo();

twtLink.setAttribute("href", `#`)
fbLink.setAttribute("href", `#`)
waLink.setAttribute("href", `#`)
socials.style = "display: block;"
          })

  }
                      }
            )
  }

function getConstituencyName(postcode) {
  fetch(`https://api.postcodes.io/postcodes/${postcode}`)
    .then(res => res.json())
    .then(data => {
      if(data.status != 200) {
        error.innerHTML = "Sorry, looks like that's an invalid postcode."
        error.style.display = "block";
      } else {
      let constituency = data.result.parliamentary_constituency
      let constituencyString = constituency.toString()
      printMessageToScreen(constituencyString)
      }
    }
    )
}

getConstituencyName(postcode);

})

})
