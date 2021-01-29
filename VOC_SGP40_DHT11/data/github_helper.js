

// Used to easily interface with GitHub.
class GithubHelper {
    constructor({username, password, token, repo}) {
        this.username = username;
        this.password = password;
        this.token = token;
        this.repo = repo;

        this.apiBase = "https://github.com";

        
        this.currTime = new Date(new Date().getTime());  // Current time in milliseconds.

        // Directory name of where the data will be saved.
        this.dirName = this.currTime.getDate()     +     "-" +
                       this.currTime.getMonth()    + 1 + "-" +
                       this.currTime.getFullYear() +     "_" +
                       this.currTime.getHours()    +     "-" +
                       this.currTime.getMinutes()  +     "-" +
                       this.currTime.getSeconds();


        this.setup_github();
    }


    setup_github() {
        this.github = new GitHub({
            username: this.username,
            password: this.password,
            token: this.token,
            apiBase: this.apiBase
        });

        this.repo = this.github.getRepo(this.username, this.repo);
    }


    // Used to save data to repository.
    saveData({filename, data}) {
        
        // If multiple data arrays are passed in, combine them all into one array where the values are seperated by spaces.
        // A line will be in this format: "timeInMS VOC SGP40 humidity temperature".
        if(Array.isArray(data)) {
            var combinedData = [];
            for(var i = 0; i < data[0].length; i++) {
                var dataLine = data[0][i][0].toString() + " ";  // Choosing first data array as the time(x) will be the same for all.

                for(var j = 0; j < data.length; j++) {
                    dataLine = dataLine + data[j][i][1].toString() + " ";
                }

                combinedData.push(dataLine);
            }

            data = combinedData;
        }

        this.repo.writeFile(
            "main",
            this.dirName + "/" + filename,
            data.join("\n"),
            this.dirName + " saved " + filename,
            function(err) {}
        );
    }
}