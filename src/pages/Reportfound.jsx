function Reportfound(){
    return(
        <div className="page report-found">
            <div className="glass">
                <div className="glass-inner">
                    <div className="col">
                        <h1>Found</h1>
                        <p>Report an item you found so its owner can be reunited.</p>
                    </div>
                    <div className="col">
                        <form>
                            <input type="text" placeholder="Item name" />
                            <textarea name="" id="" placeholder="Description" />
                            <input type = "text" placeholder="Location" />
                            <button type = "submit">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Reportfound;