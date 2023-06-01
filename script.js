number_of_subnets = 0
subnets = []
let ip = document.getElementById("network_input").value;

//add_subnet("A", 121);
//add_subnet("B", 62);
//add_subnet("C", 2);
//add_subnet("D", 7);
//add_subnet("E", 14);

function save_network() {
    document.getElementById("saved_network").innerText = ip
    mask = parseInt(ip.split("/")[1])
    if ((mask >= 24) && (mask <=30)) {
        console.log(mask);
        setup_square(mask);
    }
}

function setup_square(mask) {
    if (mask === 24) {
        return;
    }
    if (mask === 25) {
        // TODO
        return;
    }
}

function halve(rectangle_object) {
    var flip = {"hor": "vert",
                "vert": "hor"}
    var orientation = flip[rectangle_object["last_division"]]

    if (orientation === "hor") {
        half_1 = document.createElement('div');
        half_1.classList.add("halver_hor")
        half_1.style ="float: left; border-left: none;"

        half_2 = document.createElement('div');
        half_2.classList.add("halver_hor")
        half_2.style ="float: right;"

        rectangle_object["square"].appendChild(half_1);
        rectangle_object["square"].appendChild(half_2);
    }

    if (orientation === "vert") {
        half_1 = document.createElement('div');
        half_1.classList.add("halver_vert")
        half_1.style ="float: top; "

        half_2 = document.createElement('div');
        half_2.classList.add("halver_vert")
        half_2.style = "border-bottom: none;"


        rectangle_object["square"].appendChild(half_1);
        rectangle_object["square"].appendChild(half_2);
        
    }
    
    var new_capacity = rectangle_object["capacity"] / 2;

    var half_1_min = rectangle_object["min"];
    var half_1_max = half_1_min + new_capacity - 1;

    var half_2_min = half_1_max + 1;
    var half_2_max = half_2_min + new_capacity;

    return [{"square": half_1,
             "capacity": new_capacity,
             "min" : half_1_min,
             "max" : half_1_max,
             "last_division": orientation
            },
            {"square": half_2,
            "capacity": new_capacity,
            "min" : half_2_min,
            "max" : half_2_max,
            "last_division": orientation
           }]

}

function add_subnet(name, size) {

const table = document.getElementById("table");

let row = document.createElement("tr");

let name_element = document.createElement("td");
name_element.classList.add("subnet_table_name")
name_element.innerText = name

let hosts = document.createElement("td");
hosts.classList.add("subnet_table_hosts")
hosts.innerText = size

table.appendChild(row);
row.appendChild(name_element);
row.appendChild(hosts);

subnets.push({"name": name,
              "size": size,
              "order": number_of_subnets,
            })

number_of_subnets++
}

function write_subnets_and_masks(subnets) {

    subnets = subnets.sort((a, b) => (a.order > b.order) ? 1 : (a.order < b.order) ? -1 : 0);

    console.log(subnets);
    const results = document.getElementById("result");
    results.innerHTML = "";
    for (k in subnets) {
    
    subnet_row = document.createElement("tr");
    subnet_row.classList.add("subnet_row")

    subnet_name = document.createElement("td");
    subnet_name.classList.add("subnet_table_name")
    subnet_name.innerText = subnets[k].name;

    ip_without_last_byte = ip.split("/")[0].split(".");
    ip_without_last_byte.pop();
    ip_without_last_byte = ip_without_last_byte.join(".") + ".";
    
    console.log("IP", ip_without_last_byte);

    subnet_ip = document.createElement("td");
    subnet_ip.classList.add("subnet_table_address")
    subnet_ip.innerText = ip_without_last_byte + String(subnets[k].start_ip);
    
    subnet_mask = document.createElement("td");
    subnet_mask.classList.add("subnet_table_mask")
    subnet_mask.innerText = " / "+subnets[k]["mask_/"];

    subnet_mask_full = document.createElement("td");
    subnet_mask_full.classList.add("subnet_table_mask_full")
    subnet_mask_full.innerText = "." + subnets[k]["mask"];

    
    subnet_row.appendChild(subnet_name);
    subnet_row.appendChild(subnet_ip);
    subnet_row.appendChild(subnet_mask);
    //subnet_row.appendChild(subnet_mask_full);

    results.appendChild(subnet_row);
    }
}

function calculate() {
subnets_and_sizes = []
const square = document.getElementById("vlsm_square");
    for (i in subnets) {
        size = Math.pow(2,Math.ceil(Math.log((parseInt(subnets[i].size) + 2))/Math.log(2)))
        subnets_and_sizes.push({"name": subnets[i].name,
                                "size": size,
                                "order": subnets[i]["order"]
                                });
}
    subnets_and_sizes = subnets_and_sizes.sort((a, b) => (a.size < b.size) ? 1 : (a.size > b.size) ? -1 : 0);
console.log(subnets_and_sizes);
results = generate_square(subnets_and_sizes);

write_subnets_and_masks(results)

}

function add_subnet_name_and_ips(rectangle, name) {
    name_of_subnet = document.createElement("div");
    name_of_subnet.classList.add("subnet_name")
    name_of_subnet.innerText = name;

    rectangle["square"].appendChild(name_of_subnet);

    start_ip = document.createElement('div');
    start_ip.classList.add("start_ip");
    start_ip.innerText = rectangle["min"];
    rectangle["square"].appendChild(start_ip);

    end_ip = document.createElement('div');
    end_ip.classList.add("end_ip");
    end_ip.innerText = rectangle["max"];
    rectangle["square"].appendChild(end_ip);

}

function generate_square(subnets_and_sizes) {

    final_subnets = [];

    const size_to_mask = {  256: "24",
                            128: "25",
                            64: "26",
                            32: "27",
                            16: "28",
                            8: "29",
                            4: "30",  }

    let rectangles = [{ "square": document.getElementById("vlsm_square"),
                        "capacity": 256,
                        "min" : 0,
                        "max" : 255,
                        "last_division": "vert"}]

    rectangles[0]["square"].innerHTML = "";

    while (subnets_and_sizes.length != 0) {
        if ((subnets_and_sizes[0].size) === rectangles[0]["capacity"]){
            
            add_subnet_name_and_ips(rectangles[0], subnets_and_sizes[0].name);
            
            final_subnets.push({"name": subnets_and_sizes[0].name,
                                "start_ip": rectangles[0]["min"],
                                "mask": rectangles[0]["capacity"],
                                "mask_/": size_to_mask[rectangles[0]["capacity"]],
                                "order": subnets_and_sizes[0]["order"]
                                });
            console.log(rectangles[0])

            subnets_and_sizes.shift();
            rectangles.shift();
            
            

    }  else if ((subnets_and_sizes[0].size) < rectangles[0]["capacity"]){
            //console.log(rectangles[0].square, rectangles)
            halves = halve(rectangles[0]);
            rectangles.shift();
            rectangles.push(halves[0]);
            rectangles.push(halves[1]);

    }   else { return  }
    }
    return final_subnets;
}


